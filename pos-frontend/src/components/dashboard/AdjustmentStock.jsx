import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  getStockTransactions,
  createStockTransaction,
  getProducts,
  getUnits,
} from "../../https";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdjustmentStock() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [productId, setProductId] = useState("");
  const [type, setType] = useState("IN");
  const [qty, setQty] = useState("");
  const [unitId, setUnitId] = useState("");
  const [note, setNote] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: productsData } = useQuery(["products"], getProducts);
  const { data: unitsData } = useQuery(["units"], getUnits);

  const { data: transactionsData, isLoading,  refetch } = useQuery(
    ["stockTransactions"],
    getStockTransactions,
    {
        refetchInterval: 10000,
    }
  );

  const mutation = useMutation(createStockTransaction, {
    onSuccess: () => {
      enqueueSnackbar("Stock adjusted successfully", { variant: "success" });
      queryClient.invalidateQueries(["stockTransactions"]);
        refetch();
      setProductId("");
      setType("IN");
      setQty("");
      setUnitId("");
      setNote("");
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !qty || !unitId) {
      return enqueueSnackbar("Please fill all required fields", { variant: "warning" });
    }
    mutation.mutate({ product: productId, type, qty: Number(qty), unit: unitId, note });
  };

  const totalTransactions = transactionsData?.data?.length || 0;
  const totalPages = Math.ceil(totalTransactions / perPage);
  const paginatedData = transactionsData?.data?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen p-6" : "bg-white text-black min-h-screen p-6"}>
      <Button onClick={() => setDarkMode(!darkMode)} className="mb-4">
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </Button>

      <Card className={darkMode ? "bg-gray-800" : ""}>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label>Product</label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData?.data?.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">IN</SelectItem>
                    <SelectItem value="OUT">OUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Qty</label>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Unit</label>
                <Select value={unitId} onValueChange={setUnitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsData?.data?.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.short}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label>Note</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
            </div>
            <Button type="submit" className="mt-2">Submit Adjustment</Button>
          </form>
        </CardContent>
      </Card>

      <Card className={darkMode ? "bg-gray-800 mt-6" : "mt-6"}>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Adjustment History</h2>
          <div className="overflow-x-auto">
            <Table className={darkMode ? "bg-gray-700" : ""}>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : paginatedData?.length ? (
                  paginatedData.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{new Date(t.createdAt).toLocaleString("id-ID")}</TableCell>
                      <TableCell>{t.product?.name || "-"}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.qty}</TableCell>
                      <TableCell>{t.unit?.short || "-"}</TableCell>
                      <TableCell>{t.note || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No adjustments yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>
              Menampilkan {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalTransactions)} dari {totalTransactions} data
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <Button key={pNum} onClick={() => setPage(pNum)} variant={pNum === page ? "default" : "outline"}>
                  {pNum}
                </Button>
              ))}
              <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={n.toString()}>{n} per halaman</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
