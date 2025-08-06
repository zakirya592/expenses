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
import { FaListOl } from "react-icons/fa";

const IndexRangeModal = ({ isOpen, onClose, onGenerate, maxIndex }) => {
  const [startIndex, setStartIndex] = useState("1");
  const [endIndex, setEndIndex] = useState(maxIndex ? maxIndex.toString() : "10");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    const start = parseInt(startIndex);
    const end = parseInt(endIndex);

    if (isNaN(start) || start < 1) {
      return alert("Please enter a valid start index (minimum 1)");
    }
    if (isNaN(end) || end < start) {
      return alert("End index must be greater than or equal to start index");
    }
    if (maxIndex && end > maxIndex) {
      return alert(`End index cannot exceed the maximum available (${maxIndex})`);
    }

    setLoading(true);
    onGenerate(start, end);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="bg-white dark:bg-gray-800"
      size="sm"
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
              Select Expense Range for PDF
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Start Index"
                    placeholder="Enter start index (min: 1)"
                    variant="bordered"
                    type="number"
                    min="1"
                    max={maxIndex ? maxIndex.toString() : undefined}
                    value={startIndex}
                    onChange={(e) => setStartIndex(e.target.value)}
                    className="w-full"
                    startContent={
                      <FaListOl className="text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </div>
                <div>
                  <Input
                    label="End Index"
                    placeholder={`Enter end index (max: ${maxIndex || 'all'})`}
                    variant="bordered"
                    type="number"
                    min="1"
                    max={maxIndex ? maxIndex.toString() : undefined}
                    value={endIndex}
                    onChange={(e) => setEndIndex(e.target.value)}
                    className="w-full"
                    startContent={
                      <FaListOl className="text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {maxIndex ? `Available range: 1 to ${maxIndex}` : 'Enter the range of expenses to include in the PDF'}
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

export default IndexRangeModal;