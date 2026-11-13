"""Local pdf-inspector Markdown extraction only; no OCR or remote services."""

import argparse
import hashlib
import importlib.metadata
import json
from pathlib import Path

import pdf_inspector


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdfs", nargs="+", type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    targets = []
    for pdf in args.pdfs:
        if not pdf.is_file() or pdf.suffix.lower() != ".pdf":
            parser.error("Expected an existing PDF: " + str(pdf))
        targets.extend([args.output_dir / (pdf.stem + ".md"),
                        args.output_dir / (pdf.stem + "-summary.json")])
    if len(set(targets)) != len(targets) or any(p.exists() for p in targets):
        parser.error("Duplicate or existing output; choose a fresh output directory.")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for pdf in args.pdfs:
        result = pdf_inspector.process_pdf(str(pdf))
        if not result.markdown or not result.markdown.strip():
            raise SystemExit("No native Markdown produced: " + str(pdf))
        output = args.output_dir / (pdf.stem + ".md")
        markdown = result.markdown.encode("utf-8")
        summary = {
            "parser": "pdf-inspector",
            "parser_version": importlib.metadata.version("pdf-inspector"),
            "method": "process_pdf; native text only; no OCR",
            "source_pdf": pdf.as_posix(),
            "pdf_sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
            "markdown_path": output.as_posix(),
            "markdown_sha256": hashlib.sha256(markdown).hexdigest(),
            "markdown_bytes": len(markdown),
            "pdf_type": result.pdf_type,
            "page_count": result.page_count,
            "pages_needing_ocr": list(result.pages_needing_ocr),
            "has_encoding_issues": result.has_encoding_issues,
            "pages_with_columns": list(result.pages_with_columns),
            "pages_with_tables": list(result.pages_with_tables),
        }
        with output.open("xb") as stream:
            stream.write(markdown)
        with (args.output_dir / (pdf.stem + "-summary.json")).open("x") as stream:
            json.dump(summary, stream, indent=2)
            stream.write("\n")
        print("%s: %s pages, %s bytes, OCR flags=%s, encoding issues=%s"
              % (output, result.page_count, len(markdown),
                 result.pages_needing_ocr, result.has_encoding_issues))


if __name__ == "__main__":
    main()
