import React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from './ui/Button';

export default function DataTable({ data, columns }) {
    const [sorting, setSorting] = React.useState([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    return (
        <div className="rounded-md border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto table-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-750">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-3 font-medium">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center hover:text-white' : ''}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                                )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    Nessun risultato.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
