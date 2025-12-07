"use client";

import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [value, setValue] = useState("");

  const invoke = trpc.inngest.invoke.useMutation({
    onSuccess: () => {
      toast.success("Background job started");
    },
    onError: (error: { message: string }) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Input text..."
        className="mb-4"
      />
      <Button
        disabled={invoke.isPending}
        onClick={() => invoke.mutate({ text: value })}
      >
        {invoke.isPending ? "Starting..." : "Invoke Background Job"}
      </Button>
    </div>
  );
};

export default Page;
