import sqlite3
import mysql.connector

SQLITE_DB = r"D:\Projects\dashboard_build\lseg_assets.db"

MYSQL_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "database": "belarc_assets",
    "user": "root",
    "password": "",
}


def main():
    sqlite_conn = sqlite3.connect(SQLITE_DB)
    sqlite_conn.row_factory = sqlite3.Row

    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()

    # Clear existing data from these development tables.
    # Child tables must be cleared before machines because of foreign keys.
    mysql_cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

    for table in ["software", "hotfixes", "vulnerabilities", "machines"]:
        mysql_cursor.execute(f"TRUNCATE TABLE {table}")

    mysql_cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

    # ---------------------------------------------------------
    # Machines
    # ---------------------------------------------------------
    machines = sqlite_conn.execute("""
        SELECT
            pc_name,
            department,
            os_name,
            cpu,
            cpu_cores,
            ram_gb,
            storage_gb,
            hotfix_count,
            software_count,
            vuln_count,
            has_critical_vuln,
            patch_status,
            risky_software_present
        FROM machines
    """).fetchall()

    mysql_cursor.executemany("""
        INSERT INTO machines (
            pc_name,
            department,
            os_name,
            cpu,
            cpu_cores,
            ram_gb,
            storage_gb,
            hotfix_count,
            software_count,
            vuln_count,
            has_critical_vuln,
            patch_status,
            risky_software_present,
            created_at,
            updated_at
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s,
            NOW(), NOW()
        )
    """, [
        (
            row["pc_name"],
            row["department"],
            row["os_name"],
            row["cpu"],
            row["cpu_cores"],
            row["ram_gb"],
            row["storage_gb"],
            row["hotfix_count"],
            row["software_count"],
            row["vuln_count"],
            row["has_critical_vuln"],
            row["patch_status"],
            row["risky_software_present"],
        )
        for row in machines
    ])

    print(f"Imported {len(machines)} machines")

    # ---------------------------------------------------------
    # Software
    # ---------------------------------------------------------
    software = sqlite_conn.execute("""
        SELECT pc_name, name, version, category
        FROM software
    """).fetchall()

    mysql_cursor.executemany("""
        INSERT INTO software (
            pc_name,
            name,
            version,
            category,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, %s, NOW(), NOW())
    """, [
        (
            row["pc_name"],
            row["name"],
            str(row["version"]) if row["version"] is not None else None,
            row["category"],
        )
        for row in software
    ])

    print(f"Imported {len(software)} software records")

    # ---------------------------------------------------------
    # Hotfixes
    # ---------------------------------------------------------
    hotfixes = sqlite_conn.execute("""
        SELECT pc_name, hotfix_id, installed_date
        FROM hotfixes
    """).fetchall()

    mysql_cursor.executemany("""
        INSERT INTO hotfixes (
            pc_name,
            hotfix_id,
            installed_date,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, NOW(), NOW())
    """, [
        (
            row["pc_name"],
            row["hotfix_id"],
            row["installed_date"],
        )
        for row in hotfixes
    ])

    print(f"Imported {len(hotfixes)} hotfix records")

    # ---------------------------------------------------------
    # Vulnerabilities
    # ---------------------------------------------------------
    vulnerabilities = sqlite_conn.execute("""
        SELECT pc_name, cve_id, severity, status
        FROM vulnerabilities
    """).fetchall()

    mysql_cursor.executemany("""
        INSERT INTO vulnerabilities (
            pc_name,
            cve_id,
            severity,
            status,
            created_at,
            updated_at
        )
        VALUES (%s, %s, %s, %s, NOW(), NOW())
    """, [
        (
            row["pc_name"],
            row["cve_id"],
            row["severity"],
            row["status"],
        )
        for row in vulnerabilities
    ])

    print(f"Imported {len(vulnerabilities)} vulnerability records")

    mysql_conn.commit()

    mysql_cursor.close()
    mysql_conn.close()
    sqlite_conn.close()

    print("\nImport completed successfully.")


if __name__ == "__main__":
    main()