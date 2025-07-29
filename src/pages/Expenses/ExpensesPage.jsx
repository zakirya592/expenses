
import React, { useState } from 'react';
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
    Tooltip
} from '@nextui-org/react';
import { FaSearch,  FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import { useAuth } from '../../contexts/AuthContext';
import Addexpenses from './Addexpenses';



const expenses = () => {
    
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    const fetchSales = async (key, searchTerm, invoiceNumber) => {
        const res = await userRequest.get("/sales/by-customer", {
            params: {
                startDate: startDate,
                endDate: endDate,
                paymentStatus: statusFilter === "all" ? "" : statusFilter,
                minTotalAmount: "",
                maxTotalAmount: "",
                minTotalDue: "",
                maxTotalDue: "",
                invoiceNumber: invoiceNumber,
                customer: searchTerm,
            },
        });
        return {
            transactions: res.data.data || [],
            total: res.data.results || 0,
        };
    };

    const { data, isLoading } = useQuery(
        [
            "sales",
            searchTerm,
            dateFilter,
            startDate,
            endDate,
            statusFilter,
            invoiceNumber,
        ],
        () => fetchSales("sales", searchTerm, invoiceNumber),
        { keepPreviousData: true }
    );
    const transactions = data?.transactions || [];

    const filteredTransactions = transactions.filter((transaction) => {
        if (
            !searchTerm &&
            !invoiceNumber &&
            !startDate &&
            !endDate &&
            !statusFilter
        ) {
            return true;
        }
        const matchesSearch =
            transaction?.customerName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (invoiceNumber &&
                transaction.invoiceNumber
                    ?.toLowerCase()
                    .includes(invoiceNumber.toLowerCase()));
        //    ||
        //   (invoiceNumber && transaction.totalAmount?.toString().includes(invoiceNumber)) ||
        // (invoiceNumber && transaction.dueAmount?.toString().includes(invoiceNumber)) ||
        // (invoiceNumber && transaction.paidAmount?.toString().includes(invoiceNumber));

        // console.log(matchesSearch, "matchesSearch");

        const matchesDate =
            dateFilter === "all" ||
            (dateFilter === "today" &&
                new Date(transaction.lastPurchaseDate).toDateString() ===
                new Date().toDateString()) ||
            (dateFilter === "yesterday" &&
                new Date(transaction.lastPurchaseDate).toDateString() ===
                new Date(Date.now() - 86400000).toDateString()) ||
            (dateFilter === "week" &&
                new Date(transaction.lastPurchaseDate) >=
                new Date(Date.now() - 604800000)) ||
            (dateFilter === "custom" &&
                (startDate === "" ||
                    new Date(transaction.lastPurchaseDate) >= new Date(startDate)) &&
                (endDate === "" ||
                    new Date(transaction.lastPurchaseDate) <= new Date(endDate)));

        // const matchesStatus = statusFilter === 'all' ||
        //   (statusFilter === 'paid' && transaction.paidAmount >= transaction.totalAmount) ||
        //   (statusFilter === 'unpaid' && transaction.paidAmount === 0) ||
        //   (statusFilter === 'partial' && transaction.paidAmount > 0 && transaction.paidAmount < transaction.totalAmount);

        return matchesSearch && matchesDate;
    });


    const handleLogout = () => {
        logout();
        navigate("/login");
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
              <h1 className="text-3xl font-bold text-gray-800">
                Transaction expenses
              </h1>
              <p className="text-gray-600">
                View and manage sales transactions
              </p>
            </div>

            <div className="text-right space-y-2 flex flex-row flex-wrap">
              <div className="mt-7 me-3">
                <Button color="success" onPress={() => setShowAddModal(true)}>
                  Add expenses
                </Button>
              </div>

              <div className="mx-3 text-start mt-2">
                <div className="text-sm text-gray-600">Sales</div>
                <div className="text-2xl font-bold text-green-600">
                  Rs.
                  {transactions
                    .reduce((sum, txn) => sum + txn.totalAmount, 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-4">
                <Input
                  placeholder="Search by customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<FaSearch className="text-gray-400" />}
                  className="flex-1 min-w-64"
                />
                <Input
                  placeholder="Search by invoice number..."
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  startContent={<FaSearch className="text-gray-400" />}
                  className="flex-1 min-w-64"
                />

                <div className="flex gap-2">
                  <Select
                    placeholder="Date Range"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      if (e.target.value === "custom") {
                        setStartDate("");
                        setEndDate("");
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
                    <SelectItem key="yesterday" value="yesterday">
                      Yesterday
                    </SelectItem>
                    <SelectItem key="week" value="week">
                      This Week
                    </SelectItem>
                    <SelectItem key="custom" value="custom">
                      Custom Range
                    </SelectItem>
                  </Select>

                  {dateFilter === "custom" && (
                    <>
                      <div className="felx">
                        <p>Start Date</p>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-64"
                        />
                      </div>
                      <div className="felx">
                        <p>End Date</p>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-64"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* <Select
              placeholder="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-64"
              startContent={<FaFilter />}
            >
              <SelectItem key="all" value="all">
                All Status
              </SelectItem>
              <SelectItem key="paid" value="paid">
                Paid
              </SelectItem>
              <SelectItem key="unpaid" value="unpaid">
                Unpaid
              </SelectItem>
              <SelectItem key="partial" value="partial">
                Partial
              </SelectItem>
            </Select> */}
              </div>
            </CardBody>
          </Card>

          {/* Transactions Table */}
          <div className="h-[400px] overflow-y-auto w-full overflow-x-scroll">
            <Table
              aria-label="Transactions table"
              className="w-full min-w-[1400px]"
            >
              <TableHeader>
                <TableColumn>Sl No</TableColumn>
                <TableColumn>INVOICE NUMBER</TableColumn>
                <TableColumn>DATE & TIME</TableColumn>
                <TableColumn>CUSTOMER</TableColumn>
                <TableColumn>ITEMS</TableColumn>
                <TableColumn>TOTAL</TableColumn>
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
                {filteredTransactions.map((transaction, index) => (
                  <TableRow key={transaction.lastInvoice}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono font-semibold">
                      {transaction.lastInvoice}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>
                          {new Date(
                            transaction.lastPurchaseDate
                          ).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{transaction?.customerName}</TableCell>
                    <TableCell className="font-semibold">
                      {transaction.totalSales}
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rs. {transaction.totalAmount}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => viewReceipt(transaction)}
                    >
                      <FaEye />
                    </Button> */}
                        <Tooltip content="View Details">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() =>
                              navigate(`/customers/${transaction._id}`)
                            }
                          >
                            <TbListDetails />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <Addexpenses
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          //   newCategory={newCategory}
          //   setNewCategory={setNewCategory}
          //   onAddCategory={handleAddCategory}
        />
      </div>
    );
};

export default expenses;
