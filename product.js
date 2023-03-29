let pageURL = new URL(window.location.href);//get URL of page

//extract product id from URL
let product_id = pageURL.searchParams.get("id");

//get products from localstorage
let productsArray = JSON.parse(localStorage.getItem("Products"));

//find the product from array
let product = productsArray.find((p)=>{
    if(p.id == product_id)
        return p;
});


let container = document.querySelector('.container');//container div

container.innerHTML =   
    '<div class="name">' + product.name + '</div>' + 
    
    '<div class="content">' + 
        '<div class="bubble1"></div><div class="bubble2"></div><div class="bubble3"></div>' +
        
        '<div class="image">' + 
            '<img src="' + product.img_file + '" alt="image of the product">' +
        '</div>' + 
        
        '<div class="id">Product ID: '  + product.id + '</div>' +
        
        '<div class="desc">Product Description : ' + product.desc + '</div>' + 
    '</div>'
;
