import { Button, ButtonGroup, Colors, HTMLSelect } from "@blueprintjs/core";
import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  onGotoPage?(page: number): void;
  onPageSizeChange?(pageSize: number): void;
}

function range(start: number, end: number): number[] {
  const list: number[] = [];
  for (let i = start; i <= end; i++) {
    list.push(i);
  }
  return list;
}

export function Pagination({
  page,
  pageSize,
  totalPages,
  onGotoPage,
  onPageSizeChange,
}: PaginationProps): React.ReactElement {
  const maxWingCount = 3;
  const pages = React.useMemo<(number | string)[]>(() => {
    const noEllipsisMaxPages = maxWingCount * 2 + 3;
    const overflowedPages = totalPages - noEllipsisMaxPages;
    if (overflowedPages < 1) {
      return range(1, totalPages);
    }

    const leftOverflowed = page >= maxWingCount + 3;
    const rightOverflowed = page <= totalPages - maxWingCount - 2;
    if (leftOverflowed && rightOverflowed) {
      return [
        1,
        "left",
        ...range(page - maxWingCount + 1, page + maxWingCount - 1),
        "right",
        totalPages,
      ];
    }

    if (leftOverflowed) {
      return [1, "left", ...range(totalPages - maxWingCount * 2, totalPages)];
    }

    return [...range(1, maxWingCount * 2 + 1), "right", totalPages];
  }, [page, totalPages]);

  const handlePageSizeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onPageSizeChange?.(+event.target.value);
    },
    [onPageSizeChange]
  );

  return (
    <div className="pagination">
      <ButtonGroup>
        <Button
          icon="chevron-left"
          disabled={page === 1}
          onClick={() => onGotoPage?.(page - 1)}
        />
        {pages.map((cursor) =>
          typeof cursor === "string" ? (
            <Button key={cursor} text={"···"} disabled />
          ) : cursor === page ? (
            <Button key={cursor} text={cursor} active intent="primary" />
          ) : (
            <Button
              key={cursor}
              text={cursor}
              onClick={() => onGotoPage?.(cursor)}
            />
          )
        )}
        <Button
          icon="chevron-right"
          disabled={page >= totalPages}
          onClick={() => onGotoPage?.(page + 1)}
        />
      </ButtonGroup>
      <span>
        <span style={{ color: Colors.GRAY3 }}>Items per page:&nbsp;</span>
        <HTMLSelect
          value={pageSize}
          options={[20, 50, 100]}
          onChange={handlePageSizeChange}
        />
      </span>
    </div>
  );
}
