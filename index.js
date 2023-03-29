let form = document.querySelector('.container .part1 .form form'); //form
let list = document.querySelector('.part2 .products ul'); //list container

let products = []; //array to store products from local storage

let filteredProducts = []; //array to store filtered products

let isEditing = false; //boolean to check if user is editing a product
let oldID = ''; //to store old id of product

getData(); //get data from localstorage
createProductList(products); //show those products on screen


/*--------------------------------form part----------------------------------------*/


function submitForm(e) { // if user submits the form

    e.preventDefault();

    if (checkName(form.elements[1].value.trim())) { //if name contains number or special characters
        //show warning
        alert("Product name can contain alphabets only.");
        //focus on name field
        form.elements[1].focus();
        return;
    }

    //file object for image input
    const file = new FileReader();
    file.readAsDataURL(form.elements[2].files[0]);
    
    //if user selects other formats or even a folder show error
    if(form.elements[2].files[0].type.indexOf("image") == -1){
        alert("Please add image files only.");
        return;
    }

    //when file loades
    file.onload = function () {
        
        //create object containing all form values
        let values = {
            id: form.elements[0].value.trim(),
            name: form.elements[1].value.trim(),
            img_file: file.result,
            img_name: form.elements[2].files[0].name,
            price: form.elements[3].value.trim(),
            desc: form.elements[4].value.trim(),
        }

        if (!checktheform(values)) { // if values are not valid show error message
            alert("Please enter valid values only");
            return;
        }
        else if (isEditing) {//if user is editing a product

            if (checkUniqueID(form.elements[0].value.trim(), 1)) { //check if new entered product ID is unique
                //here checkuniqueID takes number as a second argument because while editing there will already be a product with same ID(the product itself)
                alert("Product with the same ID already exists. Please enter unique IDs only.");
                form.elements[0].focus();
                return;
            }

            let index = products.findIndex(pro => pro.id == oldID);//find the product from list of products using it's old(because ID might have changed)

            //update the product
            products[index].id = form.elements[0].value.trim();
            products[index].name = form.elements[1].value.trim();
            products[index].img_file = file.result;
            products[index].price = form.elements[3].value.trim();
            products[index].desc = form.elements[4].value.trim();

            //store data in localstorage
            localStorage.setItem("Products", JSON.stringify(products));

            getData();
            createProductList(products);

            //set variable to false
            isEditing = false;

            //reset the form
            form.reset();
            alert("Product updated successfully.");
            //scroll down to product list for better user experience
            window.scrollTo(0, document.body.scrollHeight);

        }//else if block ends here

        else { //if user is not editing
            if (checkUniqueID(form.elements[0].value.trim(), 0)) {//check if ID is unique
                //here above function takes 0 as n because while adding new product there should not be any product with same ID in database
                alert("Product with the same ID already exists. Please enter unique IDs only.");
                form.elements[0].focus();
                return;
            }

            storeData(values);//add new product to database
            form.reset();

            updateProductList(values); // update the shown products on screen

            alert("Product added successfully.");
            window.scrollTo(0, document.body.scrollHeight);

        }//else block ends here

    }//onload function ends here

}//submit function ends here


//check if entered values are valid
function checktheform(v) {
    if (v.id == "" || v.name == "" || v.price == "" || v.desc == "")
        return false;
    else
        return true;
}

//check for unique ID
function checkUniqueID(i, n) {
    if (products.filter((p) => p.id == i).length > n)//return true if database does contain product with same ID
        return true;
    else
        return false;
}

//check if name only contains alphabets and space
function checkName(n) {
    console.log(n.match(/^[A-Za-z\s]+$/));
    if (n.match(/^[A-Za-z\s]+$/))
        return false;
    else
        return true;
}

//store a product in database and in product array
function storeData(x) {
    products.push(x);
    localStorage.setItem("Products", JSON.stringify(products));
}

//get data from localstorage
function getData() {
    if (localStorage.getItem("Products") != null)
        products = JSON.parse(localStorage.getItem("Products"));
}

//show products on screen
function createProductList(arr) {
    list.innerHTML = ""; //clear already shown products

    for (a of arr) {
        createProduct(a);
    }
    checkToHide();//check if we need to hide the product container and show the warning sign or show the container and hide the sign
}

//update the shown products list when user adds new product
function updateProductList(a) {
    createProduct(a);

    checkToHide();//check again for show/hide
}

/* function to create a li element with all necessary elements */
function createProduct(a) {
    list.innerHTML += '<li>' +
        '<div class="image">' +
            '<img src="' + a.img_file + '" alt="image of product">' +
        '</div>' +

        '<div class="id">ID: ' + a.id + '</div>' +

        '<div class="name">' + a.name + '</div>' +

        '<div class="price">' + a.price + ' ₹</div>' +

        '<div class="buttons">' +
            '<a class="view" href="product.html?id=' + a.id + '" target="_blank">' +
                '<img src="images/view.png" alt="view"></a>' +
            '<a class="edit" onclick="updateProduct(\'' + a.id + '\')">' +
                '<img src="images/edit.png" alt="edit"></a>' +
            '<a class="delete" onclick="deleteProduct(\'' + a.id + '\')">' +
                '<img src="images/delete.png" alt="delete"></a>' +
        '</div>' +
    '</li>';
}

function updateProduct(i) {//when user clicks edit button

    window.scrollTo(0, 0);//scroll up to form
    isEditing = true;//set isEditing to true

    let EditItem = findProduct(i);//find product user is editing to 
    oldID = EditItem.id;//save it's id as oldID

    //assign that product values to form
    form.elements[0].value = EditItem.id;
    form.elements[1].value = EditItem.name;
    form.elements[3].value = EditItem.price;
    form.elements[4].value = EditItem.desc;

    //convert the file URL to blob object
    let b = dataURItoBlob(EditItem.img_file);
    
    //Create a file object with with that blob object and stored file name
    let file = new File([b], EditItem.img_name, {type:"image/jpeg", lastModified:new Date().getTime()}, 'utf-8');
    
    //create datatransfer object
    let transferObj = new DataTransfer();
    transferObj.items.add(file);//add file to it

    //assign datatransfer object to form
    form.elements[2].files = transferObj.files;
}

//function to convert URL to blob object
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {type: mimeString});
}

function deleteProduct(i) {//to delete product

    let deleteItem = findProduct(i);//find the product using it's ID

    products = products.filter(p => p.id != deleteItem.id);//filter out products array without deleted product
    localStorage.setItem("Products", JSON.stringify(products));//assign products array in localstorage

    getData();
    createProductList(products);
    form.reset();
}

//find the product from given id i
function findProduct(i) {
    return products.find(pr => pr.id == i);
}

//check if we need to hide/show warn and container
function checkToHide() {

    if (products.length > 0) {//if there are products in database

        document.querySelector('.part2 .products .warn').classList.add("nowarn");//hide the warn sign
        document.querySelector(".part2 .products .features").style.display = 'flex';//display the features 
        list.style.display = 'flex';//display the products container
        return false;
    }
    else {//if there are no products in database or products item does not exists at all in localstorage

        document.querySelector(".part2 .products .features").style.display = 'none';//hide the features
        list.style.display = 'none';//hide the products container

        document.querySelector('.part2 .products .warn').classList.remove("nowarn");//show the warning sign
        return true;
    }
}
/*------------------------------------form part ends here--------------------------------------------------*/



/*------------------------------------features part begins here--------------------------------------------------*/


//search and sort
let filterId = document.querySelector(".part2 .products .features .search input");//filter input
let sortId = document.querySelector(".part2 .products .features .sortById");//sortbyid div
let sortName = document.querySelector(".part2 .products .features .sortByName");//sortbyname div
let sortPrice = document.querySelector(".part2 .products .features .sortByPrice");//sortbyprice div


function filterData() {//if user input anything in filter

    getData();//get data from localstorage

    let searchValue = filterId.value.trim();//get the search value and trim it

    if (searchValue != "") {//if search value is valid

        filteredProducts = products.filter((p) => {
            if(p.id.includes(searchValue) || p.name.includes(searchValue) || p.price.includes(searchValue))
                return p;
        });//find the product containing entered [id or name or price] value for search

        if (filteredProducts.length != 0)//if there exists products with entered value
            createProductList(filteredProducts);//show them on screen
        else {
            createProductList([]);//show nothing;
            list.innerHTML = '<li class="nofound">No such product found</li>';//show the warning sign
        }
    }
    else {//if enetered value is not valid
        createProductList(products);//show all the products
    }

    //check if any of the sorting facilties are on then sort filtered products only (means do not sort all products).
    //here div with color value rgb(224, 168, 0) indicates that functionality is on and with rgb(255, 255, 255) it is off

    if (!checkColor(sortId)) {//if sort by id is on
        //changing the color to white because sort function toggles the color because it works on click
        //(and when user click on div it toggles on and off state of functionality)
        sortId.style.color = 'rgb(255, 255, 255)';
        sortById();//then sort by id
    }
    else if (!checkColor(sortName)) {//if sort by name is on
        sortName.style.color = 'rgb(255, 255, 255)';
        sortByName();//then sort by name
    }
    else if (!checkColor(sortPrice)) {//if sort by price is on
        sortPrice.style.color = 'rgb(255, 255, 255)';
        sortByPrice();//then sort by price
    }
}


//for sorting div with color value rgb(224, 168, 0) indicates that functionality is on and with rgb(255, 255, 255) it is off

/*------sort by ID---------*/

function sortById() {
    //turn off other two functionalities
    toggleOtherSorts(sortName);
    toggleOtherSorts(sortPrice);

    if (checkColor(sortId)) {//if functionality is off
        sortId.style.color = 'rgb(224, 168, 0)';//turn it on

        let sortByIdProducts;

        if (filterId.value.trim() == "")//if user is not filtering right now
            sortByIdProducts = products.sort((x, y) => x.id - y.id);//then sort the all products
        else//if user is filtering right now
            sortByIdProducts = filteredProducts.sort((x, y) => x.id - y.id);//then sort only filtered products

        if (sortByIdProducts.length != 0)//if there are products to sort
            createProductList(sortByIdProducts);//show the sorted products
        else//if there are no products to sort(means there are no products in database)
            list.innerHTML = '<li class="nofound">No such product found</li>';//show warning
    }//if ends here
    else {//if functionality is already on and user is turning it off
        sortId.style.color = 'rgb(255, 255, 255)';//turn it off

        if (filterId.value.trim() == "") {//if user is not filtering right now
            //get all products from localstorage and show them
            getData();
            createProductList(products);
        }
        else//if user is filtering right now then filter products and show them accordingly
            filterData();
    }//else ends here
}

/*------sort by Name---------*/
function sortByName() {
    toggleOtherSorts(sortId);
    toggleOtherSorts(sortPrice);

    if (checkColor(sortName)) {//if functionality is off
        sortName.style.color = 'rgb(224, 168, 0)';//turn on

        let sortByNameProducts;
        if (filterId.value.trim() == "") {

            sortByNameProducts = products.sort((x, y) => {
                let a = x.name.toLowerCase();
                let b = y.name.toLowerCase();
                if (a > b)
                    return 1;
                else if (a < b)
                    return -1;
                else
                    return 0;
            });
        }//if ends here
        else {
            sortByNameProducts = filteredProducts.sort((x, y) => {
                let a = x.name.toLowerCase();
                let b = y.name.toLowerCase();
                if (a > b)
                    return 1;
                else if (a < b)
                    return -1;
                else
                    return 0;
            });
        }//else ends here

        if (sortByNameProducts.length != 0)
            createProductList(sortByNameProducts);
        else
            list.innerHTML = '<li class="nofound">No such product found</li>';

    }//if ends here
    else {

        sortName.style.color = 'rgb(255, 255, 255)';
        if (filterId.value.trim() == "") {
            getData();
            createProductList(products);
        }
        else
            filterData();
    }//else ends here
}


/*------sort by Price---------*/

function sortByPrice() {
    toggleOtherSorts(sortName);
    toggleOtherSorts(sortId);

    let sortByPriceProducts;

    if (checkColor(sortPrice)) {
        sortPrice.style.color = 'rgb(224, 168, 0)';

        if (filterId.value.trim() == "")
            sortByPriceProducts = products.sort((x, y) => x.price - y.price);
        else
            sortByPriceProducts = filteredProducts.sort((x, y) => x.price - y.price);

        if (sortByPriceProducts.length != 0)
            createProductList(sortByPriceProducts);
        else
            list.innerHTML = '<li class="nofound">No such product found</li>';
    }//if ends here
    else {

        sortPrice.style.color = 'rgb(255, 255, 255)';
        if (filterId.value.trim() == "") {
            getData();
            createProductList(products);
        }
        else
            filterData();
    }//else ends here
}

//check whether functionality is on/off
function checkColor(x) {

    if (x.style.color == 'rgb(255, 255, 255)' || x.style.color == "")//if it's off then return true
        return true;
    else//if it's on
        return false;

}

//change the functionalities of other sorting
function toggleOtherSorts(x) {
    x.style.color = "rgb(255, 255, 255)";
}

/*------------------------------------features part ends here--------------------------------------------------*/