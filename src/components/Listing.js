import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useAuth0 } from "@auth0/auth0-react";

const Listing = () => {
  const [listingId, setListingId] = useState();
  const [listing, setListing] = useState({});

  const { user, loginWithRedirect, isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    try {
      // If there is a listingId, retrieve the listing data
      if (listingId) {
        axios
          .get(`${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}`)
          .then((response) => {
            setListing(response.data);
          });
      }
    } catch (error) {
      console.error("Error retrieving listings", error);
    }

    // Only run this effect on change to listingId
  }, [listingId]);

  // Update listing ID in state if needed to trigger data retrieval
  const params = useParams();
  if (listingId !== params.listingId) {
    setListingId(params.listingId);
  }

  // Store a new JSX element for each property in listing details
  const listingDetails = [];
  if (listing) {
    for (const key in listing) {
      listingDetails.push(
        <Card.Text key={key}>{`${key}: ${listing[key]}`}</Card.Text>
      );
    }
  }

  const handleClick = async () => {
    // check if user is authenticated before allowing them to buy
    if (!isAuthenticated) {
      loginWithRedirect();
    } else {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://carousell/api",
          scope: "read:current_user",
        },
      });
      console.log("accessToken", accessToken);
      console.log("user.email", user.email);
      console.log("isAuthenticated", isAuthenticated);

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}`,
        {
          buyerEmail: user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("response", response.data);
      setListing(response.data);
    }
  };

  return (
    <div>
      <Link to="/">Home</Link>
      <Card bg="dark">
        <Card.Body>
          {listingDetails}
          <Button onClick={handleClick} disabled={listing.buyerId}>
            Buy
          </Button>
        </Card.Body>
      </Card>
      <br />
    </div>
  );
};

export default Listing;
