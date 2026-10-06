"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { FormField, TextControl } from "@/components/ui/FormField";
import { NAMED_LISTS } from "@/lib/config";
import { addNamedListItem } from "@/store/settingsActions";
import { openModal, showToast } from "@/store/slices/uiSlice";

export default function NamedListManager({ listKey }) {
  const dispatch = useDispatch();
  const {
    itemLabel,
    addTitle,
    inputLabel,
    placeholder,
    listTitle,
    emptyTitle,
  } = NAMED_LISTS[listKey];
  const items = useSelector((state) => state.hris[listKey]);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const result = dispatch(addNamedListItem({ listKey, rawName: newName }));
    if (result.error === "empty")
      return dispatch(showToast(`❌ Nama ${itemLabel} wajib diisi!`));
    if (result.error === "duplicate")
      return dispatch(showToast(`❌ ${itemLabel} sudah ada!`));

    setNewName("");
    dispatch(showToast(`✅ ${itemLabel} ditambahkan`));
  };

  return (
    <>
      <Card>
        <CardTitle>{addTitle}</CardTitle>
        <FormField label={inputLabel}>
          <TextControl
            placeholder={placeholder}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
          />
        </FormField>
        <Button onClick={handleAdd}>Simpan {itemLabel}</Button>
      </Card>

      <Card>
        <CardTitle>{listTitle}</CardTitle>
        {items.length ? (
          items.map(({ nama }) => (
            <div
              key={nama}
              className="mb-2 flex items-center gap-3 rounded-lg border border-line bg-surface2 px-3.5 py-3"
            >
              <div className="flex-1 text-[13.5px] font-semibold">{nama}</div>
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  dispatch(
                    openModal({
                      name: "confirmDeleteListItem",
                      payload: { listKey, name: nama },
                    }),
                  )
                }
              >
                Hapus
              </Button>
            </div>
          ))
        ) : (
          <EmptyState
            icon="📋"
            title={emptyTitle}
            description={
              listKey === "subBidang"
                ? "Tambahkan lewat form di atas."
                : undefined
            }
          />
        )}
      </Card>
    </>
  );
}
