import React, { useEffect, useState } from "react";
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

const Editexpenses = ({ isOpen, onClose, apirefetch, selectionexpense }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [Editexpenses, setEditexpenses] = useState({
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

   useEffect(() => {
     if (selectionexpense) {
       setEditexpenses({
         item: selectionexpense.item || "",
         amount: selectionexpense.amount || "0",
         description: selectionexpense.description || "",
         customer: selectionexpense.customer || "",
       });
     }
     
   }, [selectionexpense]);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await userRequest.put(`/expenses/${selectionexpense?._id || ""}`, {
        item: Editexpenses.item,
        amount: Editexpenses.amount,
        description: Editexpenses.description,
        customer: Editexpenses.customer,
      });
      setEditexpenses({
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
        error?.response?.data?.message || error.message || "Failed to add Expenses."
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
        <ModalHeader>Edit Expenses</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Item Name"
              labelPlacement="outside"
              placeholder="Enter item name"
              value={Editexpenses.item}
              onChange={(e) =>
                setEditexpenses({ ...Editexpenses, item: e.target.value })
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
                value={Editexpenses.amount}
                onChange={(e) =>
                  setEditexpenses({ ...Editexpenses, amount: e.target.value })
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
                value={Editexpenses.description}
                onChange={(e) =>
                  setEditexpenses({
                    ...Editexpenses,
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
                value={Editexpenses.customer}
                onChange={(e) =>
                  setEditexpenses({
                    ...Editexpenses,
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
            Edit Expenses
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Editexpenses;
