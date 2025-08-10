import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Textarea,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";
import { FaCalendarAlt } from "react-icons/fa";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

const EditExpenseForCustomer = ({ isOpen, onClose, apirefetch, expense, customerName }) => {
  const [loading, setLoading] = useState(false);
  const [editedExpense, setEditedExpense] = useState({
    item: "",
    amount: "",
    description: "",
    date: formatDate(new Date()),
  });

  useEffect(() => {
    if (expense) {
      setEditedExpense({
        item: expense.item || "",
        amount: expense.amount || "",
        description: expense.description || "",
        date: expense.date || formatDate(new Date()),
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedExpense({
      ...editedExpense,
      [name]: value,
    });
  };
  
  // We no longer need a dedicated date change handler as we're using the regular handleChange

  const handleUpdate = async () => {
    if (!editedExpense.item.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!editedExpense.amount || isNaN(editedExpense.amount) || Number(editedExpense.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      // Send the date directly as a string without conversion
      await userRequest.put(`/expenses/${expense._id}`, {
        item: editedExpense.item,
        amount: editedExpense.amount,
        description: editedExpense.description,
        date: editedExpense.date, // Send as string directly
      });
      onClose(false);
      setLoading(false);
      toast.success("Expense updated successfully!");
      if (apirefetch) apirefetch();
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update expense."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="bg-white dark:bg-gray-800"
      size="md"
      classNames={{
        base: "mx-2",
        header: "pb-0",
        body: "py-3",
        footer: "pt-0"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-lg sm:text-xl font-bold">
              Edit Expense for {customerName}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    autoFocus
                    label="Item"
                    placeholder="Enter item name"
                    variant="bordered"
                    name="item"
                    value={editedExpense.item}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="mb-1">
                    <span className="text-sm font-medium text-gray-700">Date (DD-MM-YY)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <Input
                        label=""
                        placeholder="DD-MM-YY"
                        variant="bordered"
                        name="date"
                        value={editedExpense.date}
                        onChange={handleChange}
                        className="w-full"
                        startContent={
                          <FaCalendarAlt className="text-default-400 pointer-events-none flex-shrink-0" />
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Input
                    label="Amount"
                    placeholder="Enter amount"
                    variant="bordered"
                    name="amount"
                    type="number"
                    value={editedExpense.amount}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    variant="bordered"
                    name="description"
                    value={editedExpense.description}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUpdate}
                isLoading={loading}
                className="font-medium"
              >
                Update Expense
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditExpenseForCustomer;