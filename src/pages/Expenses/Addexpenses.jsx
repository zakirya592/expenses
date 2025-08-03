import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Button,
    Select,
    SelectItem,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";

const Addexpenses = ({ isOpen, onClose, apirefetch }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [newexpenses, setnewexpenses] = useState({
    item: "",
    amount: "0",
    description: "",
    customer: "",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await userRequest.get("/customers");
        setCustomers(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch customers");
      }
    };

    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

    const handleAdd = async () => {
      setLoading(true);
      try {
        await userRequest.post("/expenses", {
          item: newexpenses.item,
          amount: newexpenses.amount,
          description: newexpenses.description,
          customer: newexpenses.customer,
        });
        setnewexpenses({
          item: "",
          amount: "0",
          description: "",
          customer: "",
        });
        onClose(false);
        setLoading(false);
        toast.success("Expenses added successfully!");
        apirefetch();
      } catch (error) {
        setLoading(false);
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Failed to add Expenses."
        );
      }
    };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        <ModalHeader>Add New Expenses</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Item Name"
              labelPlacement="outside"
              placeholder="Enter item name"
              value={newexpenses.item}
              onChange={(e) =>
                setnewexpenses({ ...newexpenses, item: e.target.value })
              }
              variant="bordered"
              required
            />
            <div className="my-20">
              <Input
                label="Amount"
                labelPlacement="outside"
                placeholder="Enter Amount"
                type="number"
                value={newexpenses.amount}
                onChange={(e) =>
                  setnewexpenses({ ...newexpenses, amount: e.target.value })
                }
                variant="bordered"
                required
                classNames={{
                  label: "my-2",
                }}
              />
            </div>
            <div className="my-20">
              <Input
                label="Description"
                classNames={{
                  label: "my-2",
                }}
                labelPlacement="outside"
                placeholder="Enter Expenses description"
                value={newexpenses.description}
                onChange={(e) =>
                  setnewexpenses({
                    ...newexpenses,
                    description: e.target.value,
                  })
                }
                variant="bordered"
              />
            </div>
            <div className="my-20">
              <Select
                label="Customer"
                labelPlacement="outside"
                placeholder="Select a customer"
                value={newexpenses.customer}
                onChange={(e) =>
                  setnewexpenses({
                    ...newexpenses,
                    customer: e.target.value,
                  })
                }
                variant="bordered"
                classNames={{
                  label: "my-2",
                }}
              >
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleAdd}
            isLoading={loading}
            disabled={loading}
          >
            Add Expenses
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Addexpenses;
