import axios from "axios";
import { showAlert } from "./alerts";
const stripe = Stripe(
  "pk_test_51QpBqCLTmnBFIBAfGlRfdn4LImHYjM7da2JON3ytUsVeg3lSHCkvIdh36TTkdiuJmzqDe5LGXb9rHrkvPjCAQMg800XfCcPIeH"
);

exports.bookTour = async (tourId) => {
  try {
    //: 1. Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //: 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert("error", err);
  }
};
