import React, { useState } from "react";
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

const AddExpenseForCustomer = ({ isOpen, onClose, apirefetch, customerId, customerName }) => {
  const [loading, setLoading] = useState(false);
  const [newExpense, setNewExpense] = useState({
    item: "",
    amount: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value,
    });
  };

  const handleAdd = async () => {
    if (!newExpense.item.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!newExpense.amount || isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await userRequest.post("/expenses", {
        item: newExpense.item,
        amount: newExpense.amount,
        description: newExpense.description,
        customer: customerId,
      });
      setNewExpense({
        item: "",
        amount: "",
        description: "",
      });
      onClose(false);
      setLoading(false);
      toast.success("Expense added successfully!");
      if (apirefetch) apirefetch();
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to add expense."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="bg-white dark:bg-gray-800"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
              Add Expense for {customerName}
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
                    value={newExpense.item}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    label="Amount"
                    placeholder="Enter amount"
                    variant="bordered"
                    name="amount"
                    type="number"
                    value={newExpense.amount}
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
                    value={newExpense.description}
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
                onPress={handleAdd}
                isLoading={loading}
                className="font-medium"
              >
                Add Expense
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddExpenseForCustomer;