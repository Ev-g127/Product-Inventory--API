# Demo scenario

About 3 minutes, with the Postman collection **Product Inventory API - Demo**.

## Before the demo

1. Start the server with `npm run dev`. If it is already running, type `rs` and press Enter in its terminal: the data goes back to the sample data.
2. In Postman, click **Import** and select the two `.json` files of this folder.
3. Open the collection **Product Inventory API - Demo**, and keep the terminal of the server visible: every request appears in the logs.

## The requests, in order

| # | Request | What to say | What to show |
|---|---|---|---|
| 1 | See the inventory | We start with 4 products. Each product says how many units are in each warehouse. | `Product 1`: `quantity` 20, which is 15 + 5 in `stock` |
| 2 | Create a category | We want to sell a new kind of product, so we create its category. | Status 201 |
| 3 | Create a supplier | And the supplier who sells it to us. | Status 201 |
| 4 | Create a product | A product can only use a category and a supplier that exist. Its stock is empty for now. | Status 201, `quantity` 0 |
| 5 | Receive a delivery | 30 units arrive in Warehouse 1. | `stockAfter` 30 |
| 6 | Transfer to another warehouse | We move 10 units to Warehouse 3. The total does not change. | `stockAfter` is still 30 |
| 7 | Sell some units | We sell 5 units from Warehouse 3. | `stockAfter` 25 |
| 8 | A sale that is refused | There are 25 units in total, but only 5 in Warehouse 3. The API refuses to sell 10. | Status 409, `only 5 available` |
| 9 | The history of the product | Every movement is kept. The refused one is not there. | 3 movements: `in`, `transfer`, `out` |
| 10 | What is in Warehouse 3? | We can also look at one warehouse. | `Product 4` (20 units) and `MOUSE-1` (5 units) |
| 11 | What must be ordered again? | We filter the products whose stock is low, and sort them by price. | `Product 3`, then `Product 2` |
| 12 | A deletion that is refused | A category that is still used cannot be deleted. | Status 409 |
| 13 | The statistics | And this is the summary of the inventory. | 5 products, 100 units, `stockValue` 2099 |

To play the demo again, restart the server first.

## Show the tests

Open the menu of the collection **Product Inventory API** and choose **Run**. It sends 78 requests to the 27 routes and checks 232 tests, error cases included. It deletes what it creates, so it can be run before or after the demo.
