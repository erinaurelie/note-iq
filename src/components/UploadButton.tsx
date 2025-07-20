"use client"

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);


  return (
    <Dialog 
      open={isOpen}
      onOpenChange={visible => {
        if (!visible) {
          setIsOpen(visible)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        example content
      </DialogContent>
    </Dialog>
  )
}

export default UploadButton