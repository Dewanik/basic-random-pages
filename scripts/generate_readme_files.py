from __future__ import annotations

from pathlib import Path


START_MARKER = "<!-- FILE_LIST_START -->"
END_MARKER = "<!-- FILE_LIST_END -->"
EXCLUDED_DIRS = {".git", ".github", "scripts"}
PUBLIC_FILE_EXTENSIONS = {
    ".html",
    ".htm",
    ".css",
    ".js",
    ".mjs",
    ".json",
    ".txt",
    ".xml",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".pdf",
}


def get_repo_files(repo_root: Path) -> list[str]:
    files: list[str] = []
    for path in repo_root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        if path.suffix.lower() not in PUBLIC_FILE_EXTENSIONS:
            continue
        relative = path.relative_to(repo_root).as_posix()
        files.append(relative)
    return sorted(files)


def build_markdown_list(files: list[str]) -> str:
    if not files:
        return "- (No public files found)"
    return "\n".join(f"- [{path}]({path})" for path in files)


def update_readme(repo_root: Path) -> None:
    readme_path = repo_root / "README.md"
    readme_text = readme_path.read_text(encoding="utf-8")

    if START_MARKER not in readme_text or END_MARKER not in readme_text:
        raise RuntimeError(
            "README.md is missing FILE_LIST_START/FILE_LIST_END markers."
        )

    files = get_repo_files(repo_root)
    generated_block = f"{START_MARKER}\n{build_markdown_list(files)}\n{END_MARKER}"

    start_index = readme_text.index(START_MARKER)
    end_index = readme_text.index(END_MARKER) + len(END_MARKER)

    updated_text = readme_text[:start_index] + generated_block + readme_text[end_index:]
    readme_path.write_text(updated_text, encoding="utf-8")


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    update_readme(repo_root)


if __name__ == "__main__":
    main()