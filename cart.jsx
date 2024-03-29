// simulate getting products from DataBase
const products = [
  { name: "Apples_:", country: "Italy", cost: 33, instock: 5 },
  { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
//it knows the url here. so initialURL is good
//////////////////////////////////
  //TIM --> not sure about this
  //initialData comes in empty on restock.
  //////////////////////////////
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      //data starts empty
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data

  const addToCart = (e) => {
    let name = e.target.name;

    //filter always returns an array, but we are only expecting 1 item back so we can reference 
    let item = items.filter((item) => item.name == name);
    if(item[0].instock==0) return;
    item[0].instock=item[0].instock - 1;
    //console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    //doFetch(query);
  };

  const deleteCartItem = (index) => {
     // this is the index in the cart not in the Product List

    //remove the item from the cart
    let newCart = cart.filter((item, i) => index != i);

    //which item is being deleted?
    let delItem = cart.filter((item, index) => index == index);

    //reset the items with new instock values after an item deleted
    let newItems = items.map((item, index) => {
      if (item.name == delItem[0].name){
        item.instock = item.instock + 1;
      } 
      return item;
    });
    setCart(newCart);
    setItems(newItems);



  };
  //const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/120/120";
    //item.name=item.name.replace(/\_/g,"").replace(":","");
    return (
      <div key={index}>
        <Image src={url} width={80} roundedCircle></Image>
        <Button variant="primary" size="large">
       
          {item.name} are ${item.cost} each<br /> Inventory:{item.instock}
        </Button>
        <input name={item.name} type="submit" value="Add to Cart" onClick={addToCart}></input>
      <br/>
      <br/>
      </div>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1+index} eventkey={1 + index}>
      <Accordion.Header>
        {item.name}
      </Accordion.Header>
      <Accordion.Body onClick={() => deleteCartItem(index)}
        eventkey={1 + index}>
        $ {item.cost} from {item.country}
      </Accordion.Body>
    </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
 //url ==> strapi but it is a different structure than example
    //{"data":[{"id":1,"attributes":{"name":"Apples","country":"Italy","cost":3,"instock":10,"createdAt":"2022-06-26T03:29:25.142Z","updatedAt":"2022-06-26T03:36:02.683Z","publishedAt":"2022-06-26T03:32:54.386Z"}},{
    //vs
    //[{"id":1, "name":"Apples","country":"Italy"...}]
    //////////////////
    // how do I get inside data in the new format:  data.data.attributes or data.attributes
    
    doFetch(url);
    
    let newItems = data.data.map((item) => {
    let {attributes: {name}, attributes: {country}, attributes: {cost}, attributes: {instock}} = item;
    return {name, country, cost, instock};
   
    });
  
    setItems([...items, ...newItems]);
  };

  return (

    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            //switch the order.  preventDefault() first.  THEN call restockProducts
            event.preventDefault();
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
