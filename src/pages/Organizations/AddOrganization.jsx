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

const AddOrganization = ({ isOpen, onClose, apirefetch }) => {
  const [loading, setLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  const handleAdd = async () => {
    if (!organizationName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await userRequest.post("/organizations", {
        name: organizationName,
      });
      console.log("Add organization response:", response.data);
      setOrganizationName("");
      setLoading(false);
      toast.success("Organization added successfully!");
      // Ensure refetch happens before closing the modal
      if (apirefetch) {
        await apirefetch();
      }
      onClose(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to add organization."
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
              Add New Organization
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    autoFocus
                    label="Organization Name"
                    placeholder="Enter organization name"
                    variant="bordered"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
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
                Add Organization
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddOrganization;