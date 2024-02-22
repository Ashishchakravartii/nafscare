const boxcat = document.querySelector(".scrollFilterBox.cat .box-selector");
const boxsubcat = document.querySelector(
  ".scrollFilterBox.subcat .box-selector"
);
const boxfilterdata = document.querySelector(".productsDiv");

const urlParams = new URLSearchParams(window.location.search);
const categoryParam = urlParams.get("category");

// Check the corresponding category checkbox based on the category parameter
if (categoryParam) {
  const checkbox = document.querySelector(
    `.common-selector.cat[value="${categoryParam}"]`
  );
  if (checkbox) checkbox.checked = true;
}

fetch("/category")
  .then((res) => res.json())
  .then((data) => {
    const categoryList = data.data;
    // const categoryData = <%= JSON.stringify(category) %>;

    let html = ``;

    categoryList.forEach((item) => {
      html += `<div>
                <label><input type="checkbox" class="common-selector cat" value="${item.category_id}">  
                ${item.category_name}</label>
              </div>`;
    });
    boxcat.innerHTML = html;
  });

fetch("/subcategory")
  .then((res) => res.json())
  .then((data) => {
    const subcategoryList = data.data;

    let html = ``;

    subcategoryList.forEach((item) => {
      html += `<div>
                <label><input type="checkbox" class="common-selector subcat" value="${item.subcategory_id}">
                ${item.subcategory_name}</label>
              </div>`;
    });
    boxsubcat.innerHTML = html;
  });

filterData();

function getFilter(className) {
  let filter = [];
  let commonSelector = document.querySelectorAll(
    `.${className}.common-selector:checked`
  );
  commonSelector.forEach((item) => {
    filter.push(item.value);
    console.log("line3", item.value);
  });
  return filter;
}

document.addEventListener("click", function (e) {
  const target = e.target;
  console.log("lucky1", target);
  if (target.classList.contains("common-selector")) {
    const className = target.classList.contains("cat") ? "cat" : "subcat";
    filterData(className);
  }
});

function filterData() {
  const category = getFilter("cat");
  const subcategory = getFilter("subcat");

  $.ajax({
    url: "./allcat",
    method: "GET",
    data: {
      category,
      subcategory,
    },
    success: function (result) {
      let html = ``;
      if (result.message === "Success") {
        // Use '===' for comparison
        const laptopdata = result.data;
        laptopdata.forEach((item) => {
          html += `
          <a href="/product/${item.id}">

                        <div class="product">
                            <div class="imgDiv">
                                <img src="/images/${item.image1}" alt="" />
                            </div>
                            <div class="prodContent">
                                <h6 class="prodName">${item.name}</h6>
                                <span class="priceSpan">
                                    <p class="retailPrice">INR-${item.individualPrice}</p>
                                    <p class="mrp">${item.mrp} INR</p>
                                </span>
                                <button class="addBtn">View Product</button>
                            </div>
                        </div>
        </a>
        `;
        });
      } else {
        html += `
                    <div class="product">
                        <div class="prodContent">
                            <h1>not found </h1>
                        </div>
                    </div>`;
      }
      boxfilterdata.innerHTML = html;
    },
  });
}
