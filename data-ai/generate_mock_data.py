"""Generate deterministic mock Belarc-style CSV data for the asset platform.

This replaces the missing raw Belarc collection/parsing stage for local development.
The data is intentionally synthetic and is not derived from real company assets.
"""
from __future__ import annotations

import csv
import random
from pathlib import Path

SEED = 42
N_MACHINES = 520
OUT = Path("parsed_output")

DEPARTMENTS = ["Finance", "HR", "IT", "Operations", "Sales", "Marketing", "Legal", "Procurement"]
OS = ["Windows 11 Pro", "Windows 10 Pro"]
CPUS = ["Intel Core i5-10500", "Intel Core i5-12400", "Intel Core i7-10700", "Intel Core i7-12700", "AMD Ryzen 5 5600G"]
SOFTWARE = [
    "Microsoft 365 Apps", "Google Chrome", "Mozilla Firefox", "Microsoft Edge",
    "Adobe Acrobat Reader", "Visual Studio Code", "Python 3.13", "Git",
    "7-Zip", "VLC Media Player", "TeamViewer", "AnyDesk", "PuTTY",
    "WinSCP", "Power BI Desktop", "Microsoft SQL Server Management Studio",
    "Postman", "Docker Desktop", "Node.js", "Java Runtime Environment",
    "Zoom Workplace", "Microsoft Teams", "Slack", "OBS Studio", "qBittorrent",
]
CVE_PREFIX = ["CVE-2024", "CVE-2025", "CVE-2026"]
SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM"]


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    rng = random.Random(SEED)
    OUT.mkdir(parents=True, exist_ok=True)

    machines: list[dict] = []
    software_rows: list[dict] = []
    hotfix_rows: list[dict] = []
    vulnerability_rows: list[dict] = []

    for i in range(1, N_MACHINES + 1):
        pc = f"PC-{i:04d}"
        dept = rng.choice(DEPARTMENTS)
        os_name = rng.choices(OS, weights=[0.62, 0.38], k=1)[0]
        cpu_cores = rng.choice([4, 6, 8, 10, 12, 16])
        ram_gb = rng.choice([4, 8, 8, 16, 16, 32, 64])
        storage_gb = rng.choice([256, 512, 512, 1024, 2048])
        patch_status = rng.choices(["Full", "Partial", "Minimal"], weights=[0.62, 0.28, 0.10], k=1)[0]
        hotfix_count = rng.randint(2, 22) if patch_status == "Full" else rng.randint(0, 12)

        software_count = rng.randint(8, 24)
        chosen_software = rng.sample(SOFTWARE, k=software_count if software_count <= len(SOFTWARE) else len(SOFTWARE))
        risky_names = {"TeamViewer", "AnyDesk", "qBittorrent"}
        risky_present = any(x in risky_names for x in chosen_software)

        vuln_count = rng.choices([0, 1, 2, 3, 4, 5, 6, 8], weights=[18, 18, 15, 12, 10, 8, 5, 2], k=1)[0]
        if patch_status == "Minimal":
            vuln_count += rng.randint(1, 4)
        has_critical = 1 if vuln_count and (rng.random() < (0.25 if patch_status == "Minimal" else 0.10)) else 0

        machines.append({
            "pc_name": pc,
            "department": dept,
            "os_name": os_name,
            "cpu": rng.choice(CPUS),
            "cpu_cores": cpu_cores,
            "ram_gb": ram_gb,
            "storage_gb": storage_gb,
            "hotfix_count": hotfix_count,
            "software_count": software_count,
            "vuln_count": vuln_count,
            "has_critical_vuln": has_critical,
            "patch_status": patch_status,
            "risky_software_present": int(risky_present),
        })

        for sw in chosen_software:
            software_rows.append({"pc_name": pc, "name": sw, "version": f"{rng.randint(1, 24)}.{rng.randint(0, 9)}"})

        for j in range(hotfix_count):
            hotfix_rows.append({"pc_name": pc, "hotfix_id": f"KB{rng.randint(5000000, 5999999)}", "installed_date": f"2026-{rng.randint(1,9):02d}-{rng.randint(1,28):02d}"})

        for j in range(vuln_count):
            year = rng.choice(CVE_PREFIX)
            vulnerability_rows.append({
                "pc_name": pc,
                "cve_id": f"{year}-{rng.randint(10000, 99999)}",
                "severity": "CRITICAL" if has_critical and j == 0 else rng.choices(SEVERITIES, weights=[1, 4, 5], k=1)[0],
                "status": rng.choice(["Open", "Open", "Mitigated"]),
            })

    write_csv(OUT / "machines.csv", machines)
    write_csv(OUT / "software.csv", software_rows)
    write_csv(OUT / "hotfixes.csv", hotfix_rows)
    write_csv(OUT / "vulnerabilities.csv", vulnerability_rows)

    # Compatibility with the original README/test naming.
    software_summary = []
    counts: dict[str, int] = {}
    for row in software_rows:
        counts[row["name"]] = counts.get(row["name"], 0) + 1
    for name, count in sorted(counts.items(), key=lambda x: (-x[1], x[0])):
        software_summary.append({"name": name, "install_count": count})
    write_csv(OUT / "software_summary.csv", software_summary)

    print(f"Generated {len(machines):,} machines")
    print(f"Generated {len(software_rows):,} software records")
    print(f"Generated {len(hotfix_rows):,} hotfix records")
    print(f"Generated {len(vulnerability_rows):,} vulnerability records")
    print(f"Output: {OUT.resolve()}")


if __name__ == "__main__":
    main()
