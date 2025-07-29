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

const Addexpenses = ({
    isOpen,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
     const [newexpenses, setnewexpenses] = useState({
       item: "",
       amount:'0',
       description: "",
     });

    // Wrap the add handler to set loading
    const handleAdd = async () => {
        setLoading(true);
        setLoading(false);
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
