"""Build the local SQLite asset database from parsed_output/*.csv."""
from __future__ import annotations

import os
import sqlite3
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parent
CSV_DIR = BASE / os.environ.get("PARSED_OUTPUT_DIR", "parsed_output")
DB_PATH = BASE / os.environ.get("ASSET_DB_FILENAME", "lseg_assets.db")


def load_csv(conn: sqlite3.Connection, filename: str, table: str) -> None:
    path = CSV_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}. Run generate_mock_data.py first.")
    df = pd.read_csv(path)
    df.to_sql(table, conn, if_exists="replace", index=False)
    print(f"Loaded {table:<16} {len(df):>6,} rows")


def build_indexes(conn: sqlite3.Connection) -> None:
    statements = [
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_machines_pc_name ON machines(pc_name)",
        "CREATE INDEX IF NOT EXISTS idx_machines_department ON machines(department)",
        "CREATE INDEX IF NOT EXISTS idx_machines_patch_status ON machines(patch_status)",
        "CREATE INDEX IF NOT EXISTS idx_software_pc_name ON software(pc_name)",
        "CREATE INDEX IF NOT EXISTS idx_software_name ON software(name)",
        "CREATE INDEX IF NOT EXISTS idx_hotfixes_pc_name ON hotfixes(pc_name)",
        "CREATE INDEX IF NOT EXISTS idx_vulnerabilities_pc_name ON vulnerabilities(pc_name)",
        "CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity)",
    ]
    for sql in statements:
        conn.execute(sql)


def build_views(conn: sqlite3.Connection) -> None:
    views = {
        "v_patch_compliance": """
            SELECT department,
                   COUNT(*) AS total_pcs,
                   SUM(CASE WHEN patch_status='Full' THEN 1 ELSE 0 END) AS fully_patched,
                   SUM(CASE WHEN patch_status='Partial' THEN 1 ELSE 0 END) AS partially_patched,
                   SUM(CASE WHEN patch_status='Minimal' THEN 1 ELSE 0 END) AS minimally_patched,
                   ROUND(100.0 * SUM(CASE WHEN patch_status='Full' THEN 1 ELSE 0 END) / COUNT(*), 1) AS full_patch_pct
            FROM machines GROUP BY department ORDER BY department
        """,
        "v_security_risk": """
            SELECT pc_name, department, vuln_count, has_critical_vuln, patch_status,
                   (vuln_count * 10 + has_critical_vuln * 30 +
                    CASE patch_status WHEN 'Minimal' THEN 20 WHEN 'Partial' THEN 10 ELSE 0 END) AS risk_score
            FROM machines ORDER BY risk_score DESC
        """,
        "v_software_prevalence": """
            SELECT name, COUNT(*) AS install_count,
                   COUNT(DISTINCT pc_name) AS pc_count
            FROM software GROUP BY name ORDER BY install_count DESC
        """,
        "v_os_distribution": """
            SELECT os_name, COUNT(*) AS pc_count
            FROM machines GROUP BY os_name ORDER BY pc_count DESC
        """,
        "v_dept_hardware": """
            SELECT department, COUNT(*) AS total_pcs,
                   ROUND(AVG(ram_gb), 1) AS avg_ram_gb,
                   ROUND(AVG(cpu_cores), 1) AS avg_cpu_cores,
                   ROUND(AVG(storage_gb), 0) AS avg_storage_gb
            FROM machines GROUP BY department ORDER BY department
        """,
        "v_dept_risk": """
            SELECT department, COUNT(*) AS total_pcs,
                   SUM(vuln_count) AS total_vulns,
                   SUM(has_critical_vuln) AS critical_vulns,
                   ROUND(AVG(vuln_count), 2) AS avg_vulns_per_pc
            FROM machines GROUP BY department ORDER BY total_vulns DESC
        """,
    }
    for name, sql in views.items():
        conn.execute(f"DROP VIEW IF EXISTS {name}")
        conn.execute(f"CREATE VIEW {name} AS {sql}")


def main() -> None:
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    try:
        load_csv(conn, "machines.csv", "machines")
        load_csv(conn, "software.csv", "software")
        load_csv(conn, "hotfixes.csv", "hotfixes")
        load_csv(conn, "vulnerabilities.csv", "vulnerabilities")
        # Add a deterministic first-pass software category so the dashboard and
        # tests work immediately. The existing categorise_software.py can later
        # overwrite these values with the full NLP pipeline.
        conn.execute("ALTER TABLE software ADD COLUMN category TEXT DEFAULT 'Unknown'")
        conn.execute("""
            UPDATE software
            SET category = CASE
                WHEN lower(name) LIKE '%defender%' OR lower(name) LIKE '%antivirus%'
                  OR lower(name) LIKE '%security%' THEN 'Security'
                WHEN lower(name) LIKE '%office%' OR lower(name) LIKE '%acrobat%'
                  OR lower(name) LIKE '%chrome%' OR lower(name) LIKE '%firefox%'
                  OR lower(name) LIKE '%edge%' THEN 'Productivity'
                WHEN lower(name) LIKE '%visual studio%' OR lower(name) LIKE '%python%'
                  OR lower(name) LIKE '%git%' OR lower(name) LIKE '%docker%'
                  OR lower(name) LIKE '%node.js%' OR lower(name) LIKE '%postman%'
                  OR lower(name) LIKE '%sql server%' OR lower(name) LIKE '%java%' THEN 'Development'
                WHEN lower(name) LIKE '%power bi%' OR lower(name) LIKE '%excel%'
                  OR lower(name) LIKE '%tableau%' THEN 'Finance/Analytics'
                WHEN lower(name) LIKE '%teamviewer%' OR lower(name) LIKE '%anydesk%'
                  OR lower(name) LIKE '%remote%' OR lower(name) LIKE '%putty%'
                  OR lower(name) LIKE '%winscp%' THEN 'Remote Access'
                WHEN lower(name) LIKE '%teams%' OR lower(name) LIKE '%slack%'
                  OR lower(name) LIKE '%zoom%' THEN 'Communication'
                WHEN lower(name) LIKE '%7-zip%' OR lower(name) LIKE '%vlc%'
                  OR lower(name) LIKE '%utility%' OR lower(name) LIKE '%qbittorrent%'
                  OR lower(name) LIKE '%obs studio%' THEN 'System/Utilities'
                ELSE 'Unknown'
            END
        """)
        conn.commit()
        build_indexes(conn)
        build_views(conn)
        conn.commit()
    finally:
        conn.close()

    print(f"\nSQLite database created: {DB_PATH}")


if __name__ == "__main__":
    main()
