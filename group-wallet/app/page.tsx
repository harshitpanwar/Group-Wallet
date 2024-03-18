"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import React from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.string().min(1, {
    message: "Amount must be at least 1 characters.",
  }),
  paid_by: z.string().min(1, {
    message: "Paid by must be at least 1 characters.",
  }),
  split_type: z.string().min(1, {
    message: "Split type must be at least 1 characters.",
  }),

})

export default function Home() {

  const [isFormVisible, setIsFormVisible] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      description: "",
      amount: "",
      paid_by: "",
      split_type: "",

    },
  })
 
  function onSubmit(values: z.infer<typeof formSchema>) {

    // store in the local storage in a list of expenses
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.push(values);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    //toast message for success
    alert("Expense added successfully");

    form.reset();

    
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      {isFormVisible && (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="items-center justify-center">
        
          <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
          />

          <FormField 
            control={form.control} 
            name="description"
            render ={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a Description" {...field} />
                </FormControl>
                {/* Any additional fields for description */}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {
            form.getValues('username') && form.getValues('username').length>0 && (
              <FormField
                control={form.control}
                name="paid_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid By</FormLabel>
                    <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="you">You</SelectItem>
                        <SelectItem value="user">{form.getValues('username')}</SelectItem>
                      </SelectContent>
                    </Select>

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }
          

          <FormField
            control={form.control}
            name="split_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Split Type</FormLabel>
                <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equally" > Equally </SelectItem>
                      <SelectItem value="You owe the full amount" > You owe the full amount </SelectItem>
                      <SelectItem value="They owe the full amount" > They owe the full amount </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="mt-5 mb-5 items-center justify-center">
          <Button type="submit">Submit</Button>
          <Button className="ml-5 " onClick={() => setIsFormVisible(false)}>Close</Button>
        </div>
        </form>
      </Form>
      )}

      {
        !isFormVisible && (
          <Button className="" onClick={() => setIsFormVisible(true)}>Add a new expense</Button>
        )
      }

    </div>
  )
}
