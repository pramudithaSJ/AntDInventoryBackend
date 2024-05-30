const ReceiptModel = require("../models/receipt-model");
const CustomerModel = require("../models/customer-model");
const chequesModel = require("../models/cheque-model");
const InvoiceService = require("./invoice-service");
// async function createReceipt(receipt) {

//     try {
//         const newReceipt = new ReceiptModel(receipt);
//         const Order = await OrderModel.findById(receipt.order);

//         if (Order) {
//             if (Order.total >= (Order.paid_amount + receipt.receipt_amount)) {
//                 if (Order.total === Order.paid_amount) {
//                     return { status: 400, error: "This Order is already paid" };
//                 }
//                 Order.paid_amount = Order.paid_amount + receipt.receipt_amount;
//                 Order.save();
//                 const result = await newReceipt.save();
//                 if (result) {
//                     return { status: 200, result };
//                 }
//                 else {
//                     console.log("Error while saving receipt", result);
//                     return { status: 400, error: "Error while saving receipt" };
//                 }
//             }
//             else {
//                 return { status: 400, error: "This Amount can't be charged" };
//             }
//         }

//     } catch (error) {
//         console.log(error);
//         throw new Error(error);
//     }

// }
async function createReceipt(receipt) {
  try {
    const newReceipt = new ReceiptModel(receipt);
    const result = await newReceipt.save();

    if (receipt.paymentMethod === "cheque") {
      const cheque = await chequesModel.create({
        cheque_no: receipt.chequeNo,
        bank: receipt.bank,
        amount: receipt.receipt_amount,
        date: receipt.chequeDate,
        customer: receipt.customer,
        status: "pending",
        remarks: receipt.remarks,
      });
      const result = await InvoiceService.updateInvoice(receipt.invoice);
      return { status: 200, result };
    } else {
      const Customer = await CustomerModel.findById(receipt.customer);
      // Customer.paidAmount = Customer.paidAmount + receipt.receipt_amount;
      Customer.walletBalance = Customer.walletBalance + receipt.walletBalance;
      const result = await InvoiceService.updateInvoice(receipt.invoice);
      // if (Customer.paidAmount >= Customer.orderedAmount) {
      //     Customer.balance = Customer.paidAmount - Customer.orderedAmount;
      // }
      //   await Customer.save();
      if (result.status === 400) {
        return { status: 400, error: result.error };
      }
      return { status: 200, result };
    }
  } catch (err) {
    return { status: 400, error: err };
  }
}
async function getReceipts() {
  try {
    const result = await ReceiptModel.find()
      .sort({ createdAt: -1 })
      .populate("invoice");
    return { status: 200, result };
  } catch (error) {
    return { status: 400, error };
  }
}

module.exports = {
  createReceipt,
  getReceipts,
};
