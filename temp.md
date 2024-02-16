fonts

"jostRegular"


<!-- logic for checking product hav reviwed or not  -->

router.get("/product/:productId", async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const userId = req.session.user.id;

        // Check if the user has purchased the product but has not reviewed it
        const [orderRows] = await pool.execute(
            "SELECT * FROM orders WHERE user_id = ? AND product_id = ? AND reviewed = 0",
            [userId, productId]
        );

        // If the user has purchased the product but has not reviewed it yet, display the review form
        if (orderRows.length > 0) {
            res.render("productPage", { title: "Product Page", user: req.session.user, reviewFormVisible: true });
        } else {
            res.render("productPage", { title: "Product Page", user: req.session.user, reviewFormVisible: false });
        }
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


<!-- front end check for product review ----------- -->

<%# if (reviewFormVisible) { %>
    <!-- Display review form (input box and stars) here -->
<%# } %>
