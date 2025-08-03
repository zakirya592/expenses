import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";

const AddCustomer = ({ isOpen, onClose, apirefetch }) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const handleAdd = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setLoading(true);
    try {
      await userRequest.post("/customers", {
        name: customerName,
      });
      setCustomerName("");
      onClose(false);
      setLoading(false);
      toast.success("Customer added successfully!");
      if (apirefetch) apirefetch();
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to add customer."
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
              Add New Customer
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    autoFocus
                    label="Customer Name"
                    placeholder="Enter customer name"
                    variant="bordered"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                Add Customer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddCustomer;