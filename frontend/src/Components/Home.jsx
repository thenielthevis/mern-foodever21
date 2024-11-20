import React from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  return (
    <div className="landing-page">
      <Carousel interval={3000} className="full-screen-carousel">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="./images/burger-banner.jpg"
            alt="Burgerbanner"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="./images/sizzling-banner.jpg"
            alt="Sizzlingbanner"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="./images/drinks-banner.jpg"
            alt="Drinksbanner"
          />
        </Carousel.Item>
      </Carousel>

      <div className="menu-container">
        <div className="menu-item">
          <img
            className="menu"
            src="./images/RiceMeal.jpg"
            alt="RiceMeal"
          />
          <div className="menu-details">
            <h1>RICE MEALS MENU</h1>
            <h3>Indulge in our mouthwatering rice meals, crafted to satisfy your cravings and warm your heart.</h3>
            <button className='index-button'>Order Now!</button>
          </div>
        </div>
        <div className="menu-item">
          <img
            className="menu"
            src="./images/SandwichMenu.jpg"
            alt="SandwichMenu"
          />
          <div className="menu-details">
            <h1>SANDWICHES MENU</h1>
            <h3>Experience the perfect blend of fresh ingredients and flavors that will take your taste buds on a delightful journey.</h3>
            <button className='index-button'>Order Now!</button>
          </div>
        </div>
        <div className="menu-item">
          <img
            className="menu"
            src="./images/PastaMenu.jpg"
            alt="PastaMenu"
          />
          <div className="menu-details">
            <h1>PASTA MENU</h1>
            <h3>Each plate is crafted with premium ingredients, bursting with flavors that will transport you to the heart of Italy. Perfectly cooked, perfectly sauced—get ready to twirl your fork into deliciousness!</h3>
            <button className='index-button'>Order Now!</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
