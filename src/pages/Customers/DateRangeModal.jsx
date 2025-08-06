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
import { FaCalendarAlt } from "react-icons/fa";

const DateRangeModal = ({ isOpen, onClose, onGenerate }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    if (!startDate) {
      return alert("Please select a start date");
    }
    if (!endDate) {
      return alert("Please select an end date");
    }

    setLoading(true);
    onGenerate(startDate, endDate);
    setLoading(false);
    onClose();
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
              Select Date Range for PDF
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Start Date"
                    placeholder="Select start date"
                    variant="bordered"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                    startContent={
                      <FaCalendarAlt className="text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </div>
                <div>
                  <Input
                    label="End Date"
                    placeholder="Select end date"
                    variant="bordered"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                    startContent={
                      <FaCalendarAlt className="text-default-400 pointer-events-none flex-shrink-0" />
                    }
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
                onPress={handleGenerate}
                isLoading={loading}
                className="font-medium"
              >
                Generate PDF
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DateRangeModal;