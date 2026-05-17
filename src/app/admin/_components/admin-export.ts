type ExcelCellValue = string | number | boolean | null | undefined;

export type ExcelColumn<T> = {
  header: string;
  value: (row: T) => ExcelCellValue;
};

type ExportRowsToExcelOptions<T> = {
  fileName: string;
  sheetName: string;
  columns: ExcelColumn<T>[];
  rows: T[];
};

function escapeXml(value: ExcelCellValue) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cellType(value: ExcelCellValue) {
  return typeof value === "number" ? "Number" : "String";
}

function buildCell(value: ExcelCellValue) {
  return `<Cell><Data ss:Type="${cellType(value)}">${escapeXml(value)}</Data></Cell>`;
}

export function exportRowsToExcel<T>({
  fileName,
  sheetName,
  columns,
  rows,
}: ExportRowsToExcelOptions<T>) {
  if (typeof document === "undefined") {
    return;
  }

  const headerRow = columns
    .map((column) => buildCell(column.header))
    .join("");

  const bodyRows = rows
    .map((row) =>
      columns
        .map((column) => buildCell(column.value(row)))
        .join(""),
    )
    .map((cells) => `<Row>${cells}</Row>`)
    .join("");

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   <Row>${headerRow}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([workbook], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${fileName}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
