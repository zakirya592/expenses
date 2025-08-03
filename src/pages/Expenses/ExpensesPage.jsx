import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Spinner,
  Tooltip,
  Pagination,
  Modal
} from '@nextui-org/react';
import autoTable from "jspdf-autotable";
import { FaCalendarAlt, FaEdit, FaPrint, FaSignOutAlt, FaTrash, FaUserPlus } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import { useAuth } from '../../contexts/AuthContext';
import Addexpenses from './Addexpenses';
import Swal from "sweetalert2";
import toast from 'react-hot-toast';
import Editexpenses from './Editexpenses';
import AddCustomer from './AddCustomer';


// BottomContent component outside
function BottomContent({ total, page, setPage }) {
  if (!total) return null;
  const totalPages = Math.ceil(total / 10); // 10 is your limit per page

  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="text-small text-default-400">
        Total {total}
      </span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={totalPages}
        onChange={setPage}
        classNames={{
          cursor: "bg-navy-700 text-white",
        }}
      />
    </div>
  );
}

const Expenses = () => {
  const { user, logout } = useAuth();
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [amountFilterType, setAmountFilterType] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [totalamount, setTotalamount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 1. Return the full response object
  const fetchexpenses = async () => {
    let url = `/expenses?page=${page}&limit=${limit}`;
    if (dateFilter !== "all") {
      if (dateFilter === "custom") {
        if (startDate) url += `&startDate=${startDate}`;
        if (EndDate) url += `&endDate=${EndDate}`;
      } else {
        url += `&week=${dateFilter}`;
      }
    }
    if (amountFilterType === "equals" && amountValue) {
      url += `&amountEquals=${amountValue}`;
    } else if (amountFilterType === "gt" && amountValue) {
      url += `&amountGreaterThan=${amountValue}`;
    } else if (amountFilterType === "lt" && amountValue) {
      url += `&amountLessThan=${amountValue}`;
    }
    //  if (sortOrder) {
    //    url += `&sort=amount&order=${sortOrder}`;
    //  }
    if (sortOrder === "asc") {
      url += `&sort=amount`;
    } else if (sortOrder === "desc") {
      url += `&sort=-amount`;
    }
    if (itemSearch) {
      url += `&itemSearch=${itemSearch}`;
    }

    const res = await userRequest.get(url);
    return res.data; // Return the whole response
  };
  const fetchtotalamout = async () => {
    try {
      const response = await userRequest.get(`/expenses/total`);
      const datas = response?.data?.data || "";
      setTotalamount(datas);
      console.log(datas, "datas");
    } catch (error) {
      console.error("Error fetching customer history:", error);
    }
  };

  // 2. Use correct destructuring
  const {
    data: expensesResponse = { data: [], total: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "expenses",
      dateFilter,
      startDate,
      EndDate,
      page,
      amountFilterType,
      amountValue,
      sortOrder,
      itemSearch,
    ],
    queryFn: fetchexpenses,
    keepPreviousData: true,
  });

  useEffect(() => {
    refetch();
    fetchtotalamout();
  }, [
    dateFilter,
    startDate,
    EndDate,
    page,
    amountFilterType,
    amountValue,
    sortOrder,
    itemSearch,
  ]);

  const bothapi = () => {
    refetch();
    fetchtotalamout();
  };

  const expensesdata = expensesResponse.data || [];
  const total = expensesResponse.total || 0;

  useEffect(() => {
    fetchtotalamout();
  }, []);

  const handleDelete = (expence) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${expence?.item || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/expenses/${expence?._id || ""}`);
          toast.success("The Expenses has been deleted.");
          refetch();
          fetchtotalamout();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the Expenses."
          );
        }
      }
    });
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  // PDF export function
  const exportToPdf = (data, filename) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  const totalAmount = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const titleText = filename || "Expenses Report";
  const totalText = `Total: Rs. ${totalAmount.toFixed(2)}`;

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(titleText, 10, 20); // Left side

  doc.setFontSize(14);
  doc.setTextColor(22, 160, 133); // Stylish green color
  const totalTextWidth = doc.getTextWidth(totalText);
  doc.text(totalText, pageWidth - totalTextWidth - 10, 20); //


    const headers = [["#", "Item", "Date", "Description", "Amount"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.item || "",
      new Date(row.date).toLocaleDateString(),
      row.description || "",
      row.amount || "",
    ]);
    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    return doc;
  };

  const viewPdfInNewTab = (data, filename) => {
    const doc = exportToPdf(data, filename);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000); // revoke after 10s
  };

  return (
    <div>
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            ex<span className="text-blue-600">pen</span>ses
          </h1>
          <div className="flex items-center gap-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="p-1 sm:p-1 md:p-6 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
            <p className="text-gray-600">View and manage sales expenses</p>
          </div>
          <div className="text-right space-y-2 flex flex-row flex-wrap">
            <div className="mt-7 me-3 flex gap-2">
              <Button color="success" onPress={() => setShowAddModal(true)}>
                Add expenses
              </Button>
              <Button 
                color="secondary" 
                startContent={<FaUserPlus />}
                onPress={() => setShowAddCustomerModal(true)}
              >
                Add Customer
              </Button>
              <Button
                color="primary"
                onPress={() =>
                  viewPdfInNewTab(expensesdata, "Expenses Report", itemSearch)
                }
              >
                PDF
              </Button>
            </div>
            <div className="mx-3 text-start mt-2">
              <div className="text-sm text-gray-600">Sales</div>
              <div className="text-2xl font-bold text-green-600">
                Rs. {totalamount.total || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Select
                  placeholder="Date Range"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value === "custom") {
                      setStartDate("");
                    }
                  }}
                  className="w-64"
                  startContent={<FaCalendarAlt />}
                >
                  <SelectItem key="all" value="all">
                    All Dates
                  </SelectItem>
                  <SelectItem key="today" value="today">
                    Today
                  </SelectItem>
                  {/* <SelectItem key="yesterday" value="yesterday">
                    Yesterday
                  </SelectItem> */}
                  <SelectItem key="week" value="week">
                    This Week
                  </SelectItem>
                  <SelectItem key="custom" value="custom">
                    Custom Range
                  </SelectItem>
                </Select>

                {dateFilter === "custom" && (
                  <div className="flex">
                    <div className="">
                      <p className="my-1">Start Date</p>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <div className="ms-3">
                      <p className="my-1">End Date</p>
                      <Input
                        type="date"
                        value={EndDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Select
                    placeholder="Select Filter Type"
                    selectedKeys={amountFilterType ? [amountFilterType] : []}
                    onSelectionChange={(keys) =>
                      setAmountFilterType(keys.currentKey || "")
                    }
                    className="w-64"
                  >
                    <SelectItem key="equals" value="equals">
                      Amount Equals
                    </SelectItem>
                    <SelectItem key="gt" value="gt">
                      Amount Greater Than
                    </SelectItem>
                    <SelectItem key="lt" value="lt">
                      Amount Less Than
                    </SelectItem>
                  </Select>
                </div>

                {amountFilterType && (
                  <div>
                    <Input
                      type="number"
                      placeholder={`Enter amount ${
                        amountFilterType === "equals"
                          ? "Equals"
                          : amountFilterType === "gt"
                          ? "Greater Than"
                          : "Less Than"
                      }`}
                      value={amountValue}
                      onChange={(e) => setAmountValue(e.target.value)}
                      className="w-64"
                    />
                  </div>
                )}
              </div>
              <div>
                <Select
                  placeholder="Sort by amount"
                  selectedKeys={sortOrder ? [sortOrder] : []}
                  onSelectionChange={(keys) =>
                    setSortOrder(keys.currentKey || "")
                  }
                  className="w-64"
                >
                  <SelectItem key="asc" value="asc">
                    Low to High
                  </SelectItem>
                  <SelectItem key="desc" value="desc">
                    High to Low
                  </SelectItem>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Search item..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-64"
                />
              </div>
              <div>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    setDateFilter("all");
                    setStartDate("");
                    setEndDate("");
                    setAmountFilterType("");
                    setAmountValue("");
                    setSortOrder("");
                    setItemSearch("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Expenses Table */}
        <Table
          aria-label="Expenses table"
          className="h-[400px] overflow-y-auto"
        >
          <TableHeader>
            <TableColumn>Sl No</TableColumn>
            <TableColumn>ITEM</TableColumn>
            <TableColumn>DATE & TIME</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>CREATED DATE</TableColumn>
            <TableColumn>UPDATED DATE</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={
              <div className="flex justify-center items-center py-8">
                <Spinner color="success" size="lg" />
              </div>
            }
            emptyContent={
              <div className="text-center text-gray-500 py-8">
                No expenses found
              </div>
            }
          >
            {expensesdata.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {transaction.item}
                </TableCell>
                <TableCell>
                  <div>
                    <div>{new Date(transaction.date).toLocaleString()}</div>
                  </div>
                </TableCell>
                <TableCell>{transaction?.description}</TableCell>
                <TableCell className="font-semibold">
                  {transaction.amount}
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {new Date(transaction.updatedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit Expenses">
                      <Button
                        size="sm"
                        variant="light"
                        color="warning"
                        startContent={<FaEdit />}
                        onPress={() => openEditModal(transaction)}
                      >
                        Edit
                      </Button>
                    </Tooltip>

                    <Tooltip color="danger" content="Delete Expenses">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        startContent={<FaTrash />}
                        onPress={() => handleDelete(transaction)}
                      >
                        Delete
                      </Button>
                    </Tooltip>

                    {/* <Tooltip content="Print Item Data">
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        startContent={<FaPrint />}
                        onPress={() =>
                          console.log("Selected Item:", transaction)
                        }
                      >
                        Print
                      </Button>
                    </Tooltip> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 3. Place BottomContent outside the Table */}
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
      <Addexpenses
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        apirefetch={bothapi}
      />
      <Editexpenses
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        selectionexpense={selectedExpense}
        apirefetch={bothapi}
      />
      <AddCustomer
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        apirefetch={bothapi}
      />
    </div>
  );
};

export default Expenses;
