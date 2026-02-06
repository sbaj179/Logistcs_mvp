import styles from "@/styles/DataTable.module.css";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
}

export function DataTable<T extends Record<string, string | number | undefined>>({
  columns,
  data,
  caption
}: DataTableProps<T>) {
  return (
    <div className={styles.tableWrapper}>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.key)}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
