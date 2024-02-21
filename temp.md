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

<!-- ---------------------------------- -->

 <div class="product">
      <!-- left-box -->
      <div class="p-left-box productImgDiv">
        <section class="productImgDiv-section" id="gallery">
          <div class="container productImgDiv-container">
            <div id="image-gallery productImgDiv-imageGallery">
              <div class="row mainImgBoxProduct">
                <div class="k_imgLeftBox">
                  <div class="image">
                    <div class="img-wrapper">
                      <a href="/images/chimney.webp"
                        ><img
                          src="/images/<%= product.image1 %>"
                          class="img-responsive"
                      /></a>
                      <div class="img-overlay">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                  <div class="image">
                    <div class="img-wrapper">
                      <a href="/images/image2.jpg"
                        ><img
                          src="/images/<%= product.image1 %>"
                          class="img-responsive"
                      /></a>
                      <div class="img-overlay">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="k_imgRightBox">
                  <div class="image">
                    <div class="img-wrapper">
                      <a href="/images/chimney.webp"
                        ><img
                          src="/images/<%= product.image2 %>"
                          class="img-responsive"
                      /></a>
                      <div class="img-overlay">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                  <div class="image">
                    <div class="img-wrapper">
                      <a href="/images/image2.jpg"
                        ><img
                          src="/images/<%= product.image2 %>"
                          class="img-responsive"
                      /></a>
                      <div class="img-overlay">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- End row -->
            </div>
            <!-- End image gallery -->
          </div>
          <!-- End container -->
        </section>
      </div>
      <!-- right-box -->
      <div class="p-right-box">
        <!-- title-box -->
        <div class="title-box">
          <h2>Door Handle Bar</h2>
          <h3>Boys Yellow Cotton T-shirt</h3>
          <div class="rating-box">
            <div class="rb-left">
              <h5>
                5.6
                <i class="ri-star-s-fill"></i>
              </h5>
            </div>
            <div class="rb-right">
              <p>29 Ratings</p>
            </div>
          </div>
        </div>
        <!-- price-box -->
        <div class="price-box">
          <div class="mrp-price">
            <h3>$ 170</h3>
            <h4>MRP <span class="mrp">$ 500</span></h4>
            <h3 class="off">(Rs. 499 OFF)</h3>
          </div>

          <h5>inclusive of all taxes</h5>

          <div class="select-size">
            <h4>SELECT SIZE (Age Group)</h4>
            <a href="">SIZE CHART <i class="ri-arrow-right-s-line"></i> </a>
          </div>
          <div class="size-box">
            <label>
              <input type="radio" name="size" value="4-5Y" hidden />
              <div class="size-circle">4-5Y</div>
            </label>
            <label>
              <input type="radio" name="size" value="4-5Y" hidden />
              <div class="size-circle">5-7Y</div>
            </label>
            <label>
              <input type="radio" name="size" value="4-5Y" hidden />
              <div class="size-circle">7-10Y</div>
            </label>
            <label>
              <input type="radio" name="size" value="4-5Y" hidden />
              <div class="size-circle">10-15Y</div>
            </label>
            <label>
              <input type="radio" name="size" value="4-5Y" hidden />
              <div class="size-circle">15-18Y</div>
            </label>
          </div>
          <div>
            <h3>
              Quantity
              <input
                name="qty"
                style="width: 2.5vmax"
                value="1"
                type="number"
              />
            </h3>
          </div>
          <div class="payment-box">
            <!-- <a class="pyt-btn" href=""> -->
            <i class="ri-shopping-bag-line"></i>
            <h4>
              <form action="/addCart/<%= productId %>" method="post">
                <button>Add to cart</button>
              </form>
            </h4>
            <!-- </a> -->

            <a class="pyt-btn" href="">
              <h4>Pay Now</h4>
            </a>
          </div>
        </div>

        <!-- 4 line text -->
        <div class="text">
          <h5>100% Original Products</h5>
          <h5>Pay on delivery might be available</h5>
          <h5>Easy 14 days returns and exchanges</h5>
          <h5>Try & Buy might be available</h5>
        </div>
        <div class="product-details">
          <h4>PRODUCT DETAILS</h4>
          <h5>Yellow T-shirt for boys</h5>
          <h5>Solid</h5>
          <h5>Regular length</h5>
          <h5>Round neck</h5>
          <h5>Short, regular sleeves</h5>
          <h5>Knitted cotton fabric</h5>
        </div>
        <div class="product-details">
          <h4>Size & Fit</h4>
          <h5>Regular Fits</h5>
        </div>
        <div class="product-details">
          <h4>Material & Care</h4>
          <h5>Cotton</h5>
          <h5>Machine wash</h5>
        </div>

        <!-- star rating  -->
        <div class="star-rating">
          <div class="rating-hadline">
            <h4>RATINGS</h4>
            <i class="ri-star-s-fill"></i>
            <i class="ri-star-half-fill"></i>
          </div>
          <div class="buyers-rating">
            <div class="buyers-left">
              <h1>
                5.6
                <i class="ri-star-s-fill"></i>
              </h1>
              <p>29 verified buyers</p>
            </div>
            <div class="buyers-right">
              <div class="rating-line">
                <p>5 <i class="ri-star-s-fill"></i></p>
                <div class="line"></div>
                <p>21</p>
              </div>
              <div class="rating-line">
                <p>4 <i class="ri-star-s-fill"></i></p>
                <div class="line2"></div>
                <p>21</p>
              </div>
              <div class="rating-line">
                <p>3 <i class="ri-star-s-fill"></i></p>
                <div class="line3"></div>
                <p>21</p>
              </div>
              <div class="rating-line">
                <p>2 <i class="ri-star-s-fill"></i></p>
                <div class="line4"></div>
                <p>21</p>
              </div>
              <div class="rating-line">
                <p>1 <i class="ri-star-s-fill"></i></p>
                <div class="line5"></div>
                <p>21</p>
              </div>
            </div>
          </div>
        </div>

        <!-- customer reviews -->
        <div class="customer-rev">
          <h4>Customer Reviews (3)</h4>
          <% if (reviewFormVisible) { %>
          <form
            class="reviewForm"
            action="/submit-review/<%=productId %>"
            method="post"
          >
            <span class="reviewSpan">
              <textarea
                style="resize: none"
                class="reviewTxtArea"
                name="review"
              >
Write a review...</textarea
              >
              <div class="star-rating">
                <input type="radio" id="star5" name="rating" value="5" />
                <label for="star5"><i class="fas fa-star"></i></label>

                <input type="radio" id="star4" name="rating" value="4" />
                <label for="star4"><i class="fas fa-star"></i></label>

                <input type="radio" id="star3" name="rating" value="3" />
                <label for="star3"><i class="fas fa-star"></i></label>

                <input type="radio" id="star2" name="rating" value="2" />
                <label for="star2"><i class="fas fa-star"></i></label>

                <input type="radio" id="star1" name="rating" value="1" />
                <label for="star1"><i class="fas fa-star"></i></label>
              </div>

              <button type="submit" class="reviewBtn">Submit</button>
            </span>
          </form>
          <% } %>

          <div class="customer-box">
            <div class="cr-star">
              <div class="star-5">
                <h6>5</h6>
                <i class="ri-star-s-fill"></i>
              </div>
              <p>Nice work</p>
            </div>
            <div class="cr-date">
              <p>Rajesh Prashad</p>
              <p>28-3-1990</p>

              <div class="thumb">
                <i class="ri-thumb-up-line"> 0</i>
                <i class="ri-thumb-down-line">0</i>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Code -->
        <div class="product-code">
          <h4><span class="product-text">Product Code:</span> 12345268</h4>
        </div>
      </div>
    </div>

    <!-- _____item-box html code________ -->
    <div class="item-box">
      <div class="item">
        <div class="img">
          <img src="./images/chimney.webp" alt="" />
        </div>
        <div class="img-text">
          <h3>kids wear tup</h3>
          <p>the is the riht place to</p>
          <div class="mrp-price">
            <h3>Rs 170</h3>
            <h4>MRP <span class="mrp">$ 500</span></h4>
            <h3 class="off">(Rs. 499 OFF)</h3>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="img">
          <img src="./images/chimney.webp" alt="" />
        </div>
        <div class="img-text">
          <h3>kids wear tup</h3>
          <p>the is the riht place to</p>
          <div class="mrp-price">
            <h3>Rs 170</h3>
            <h4>MRP <span class="mrp">$ 500</span></h4>
            <h3 class="off">(Rs. 499 OFF)</h3>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="img">
          <img src="./images/chimney.webp" alt="" />
        </div>
        <div class="img-text">
          <h3>kids wear tup</h3>
          <p>the is the riht place to</p>
          <div class="mrp-price">
            <h3>Rs 170</h3>
            <h4>MRP <span class="mrp">$ 500</span></h4>
            <h3 class="off">(Rs. 499 OFF)</h3>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="img">
          <img src="./images/chimney.webp" alt="" />
        </div>
        <div class="img-text">
          <h3>kids wear tup</h3>
          <p>the is the riht place to</p>
          <div class="mrp-price">
            <h3>Rs 170</h3>
            <h4>MRP <span class="mrp">$ 500</span></h4>
            <h3 class="off">(Rs. 499 OFF)</h3>
          </div>
        </div>
      </div>

      <div class="item">
        <div class="img">
          <img src="./images/chimney.webp" alt="" />
        </div>
        <div class="img-text">
          <h3>kids wear tup</h3>
          <p>the is the riht place to</p>
          <div class="mrp-price">
            <h3>Rs 170</h3>
            <h4>MRP <span class="mrp">$ 500</span></h4>
            <h3 class="off">(Rs. 499 OFF)</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- ---------------------------- nav -->

    
      /* =============================          Nav styles              ================================= */

      .navBox {
        width: 100vw;
        background-color: red;
        display: flex;
        flex-direction: column;
      }
      .topGreenBar {
        width: 100%;
        background-color: #9ee281;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.2vmax 6vmax;
        color: white;
        font-family: "jostRegular";
        font-size: 01vmax;
        font-weight: 400;
      }

      .topGreenBar-btnDiv > button {
        border: 0;
        background-color: transparent;
        color: white;
      }
      .topGreenBar-btnDiv > button > a {
        text-decoration: none;
        color: white;
      }

      .subNavBar {
        width: 100%;
        background-color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 5vmax;
        font-weight: 400;
      }

      .navimgbox {
        width: 5vmax;
        display: flex;
        align-items: center;
        gap: 1vmax;
        margin-left: -3vmax;
      }
      .navimgbox > img {
        width: 100%;
        object-fit: cover;
      }
      .brandName {
        letter-spacing: 0.2vmax;
        text-decoration: none;
        color: black;
      }

      .navLiBox {
        margin-left: 6vmax;
      }
      .navLiBox > ul {
        display: flex;
        list-style: none;
        gap: 3.5vmax;
        font-weight: 400;
        font-size: 0.9vmax;
      }
      .navLiBox > ul > li > a {
        color: black;
        text-decoration: none;
      }
      .navCartDiv {
        display: flex;
        gap: 0.3vmax;
      }
      .navCartDiv > img {
        width: 1.8vmax;
        scale: 0.85;
        margin-bottom: 0.3vmax;
      }
      .navCartDiv-searchDiv > input {
        border: 0;
      }
      .navCartDiv-searchDiv {
        scale: 0.85;
        display: flex;
      }


<!-- footer -->


/* -------------------------------- footer ----------------------------------------- */

.site-footer {
  background-color: #fff9f7;
  padding: 45px 0 20px;
  font-size: 15px;
  line-height: 24px;
  color: #737373;
}
.site-footer hr {
  border-top-color: #bbb;
  opacity: 0.5;
}
.site-footer hr.small {
  margin: 20px 0;
}
.site-footer h6 {
  color: black;
  font-size: 16px;
  text-transform: uppercase;
  margin-top: 5px;
  letter-spacing: 2px;
}
.site-footer a {
  color: #737373;
}
.site-footer a:hover {
  color: #3366cc;
  text-decoration: none;
}
.footer-links {
  padding-left: 0;
  list-style: none;
}
.footer-links li {
  display: block;
  color: black;
}
.footer-links a {
  color: black;
}
.footer-links a:active,
.footer-links a:focus,
.footer-links a:hover {
  color: #3366cc;
  text-decoration: none;
}
.footer-links.inline li {
  display: inline-block;
}
.site-footer .social-icons {
  text-align: right;
}
.site-footer .social-icons a {
  width: 40px;
  height: 40px;
  line-height: 40px;
  margin-left: 6px;
  margin-right: 0;
  border-radius: 100%;
  background-color: #33353d;
}
.copyright-text {
  margin: 0;
}
@media (max-width: 991px) {
  .site-footer [class^="col-"] {
    margin-bottom: 30px;
  }
}
@media (max-width: 767px) {
  .site-footer {
    padding-bottom: 0;
  }
  .site-footer .copyright-text,
  .site-footer .social-icons {
    text-align: center;
  }
}
.social-icons {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}
.social-icons li {
  display: inline-block;
  margin-bottom: 4px;
}
.social-icons li.title {
  margin-right: 15px;
  text-transform: uppercase;
  color: #96a2b2;
  font-weight: 700;
  font-size: 13px;
}
.social-icons a {
  background-color: #eceeef;
  color: #818a91;
  font-size: 16px;
  display: inline-block;
  line-height: 44px;
  width: 44px;
  height: 44px;
  text-align: center;
  margin-right: 8px;
  border-radius: 100%;
  -webkit-transition: all 0.2s linear;
  -o-transition: all 0.2s linear;
  transition: all 0.2s linear;
}
.social-icons a:active,
.social-icons a:focus,
.social-icons a:hover {
  color: #fff;
  background-color: #29aafe;
}
.social-icons.size-sm a {
  line-height: 34px;
  height: 34px;
  width: 34px;
  font-size: 14px;
}
.social-icons a.facebook:hover {
  background-color: #3b5998;
}
.social-icons a.twitter:hover {
  background-color: #00aced;
}
.social-icons a.linkedin:hover {
  background-color: #007bb6;
}
.social-icons a.dribbble:hover {
  background-color: #ea4c89;
}
@media (max-width: 767px) {
  .social-icons li.title {
    display: block;
    margin-right: 0;
    font-weight: 600;
  }
}

.footerBox {
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.footerWave {
  margin-top: 2.5vmax;
  padding-top: 0.5vmax;
}
.footerWave > img {
  width: 100%;
  height: 100%;
}
.Footerlogo {
  width: 6vmax;
  margin-top: -3vmax;
  padding-bottom: 1vmax;
  border-radius: 50%;
}

.reviewForm {
  padding: 1vmax 0.5vmax;
}
.reviewTxtArea {
  width: 30vmax;
  height: 8vmax;
  border-radius: 5px;
  border: 1px solid gray;
  padding: 0.4vmax;
}

.reviewBtn {
  color: white;
  background-color: #9ee281;
  border: 0;
  padding: 0.5vmax 2vmax;
  margin-top: 0.8vmax;
  border-radius: 5px;
}

.reviewSpan {
  display: flex;
  flex-direction: column;
  width: 8vmax;
}

/* ------------------------ */

/* Hide the radio buttons */
input[type="radio"] {
  display: none;
}

.star-rating {
  display: flex;
}

/* Style the labels to display the icons */
.star-rating label {
  display: inline-block;
  font-size: 24px; /* Adjust the size of the icons */
  color: #ccc; /* Default color of the icons */
}

/* Style the selected icon and all previous icons */
.star-rating input[type="radio"]:checked + label,
.star-rating input[type="radio"]:checked + label ~ label {
  color: #ffd700; /* Color of the selected icon and all previous icons */
}

/* item box css end here */
