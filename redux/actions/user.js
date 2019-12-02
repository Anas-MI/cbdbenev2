import { SET_USER, UNSET_USER, SET_CART } from "./type";
import { getUserDetails } from "../../services/apis/user";
// // import { initialCart } from "../components";

export const setUser = (user, cart = null) => dispatch => {
  // console.log({ user });
  if (user._id) {
    getUserDetails(user._id)
      .then(res => {
        console.log({ res });

        if (res.data.status && res.user) {
        //   dispatch(getUserMeta(res.data.user._id, cart));
        dispatch({
            type: SET_USER,
            payload: {
                ...res.user.userid,
                userMetaId: res.user._id,
                userMetaObj: res.user,
                userObj: res.user.userid,
            }
        })
          if (cart) {
            setCartApi({
              usermetaid: res.data.user._id,
              cart: cart
            });
          } else if (res.data.user.cart) {
            console.log({
              cart,
              res
            });
            // dispatch({
            //   type: SET_CART,
            //   payload: res.data.user.cart
            // });
          }
        }
      });
  }
  dispatch({
    type: SET_USER,
    payload: user
  });
};
// export const updateUserMeta = userId => {
//   // console.log("get user id ", { userId });

//   return dispatch => {
//     console.log({
//       dispatch
//     });
//   };
// };
// export const getUserMetaNoCart = user => {
//   // console.log({
//   //   user
//   // });
//   return dispatch => {
//     console.log("user meta start fetching");
//     getSingleUserApi(user)
//       .then(res => res.json())
//       .then(res => {
//         if (res.user && res.user._id) {
//           console.log("user meta found", res);
//           dispatch({
//             type: SET_USER,
//             payload: {
//               ...res.user.userid,
//               userMetaId: res.user._id,
//               userMetaObj: res.user
//             }
//           });
//         }
//       });
//   };
// };
// export const getUserMeta = (user, cart = null) => dispatch => {
//   getSingleUserApi(user)
//     .then(res => res.json())
//     .then(res => {
//       if (res.user && res.user._id) {
//         dispatch({
//           type: SET_USER,
//           payload: {
//             ...res.user.userid,
//             userMetaId: res.user._id,
//             userMetaObj: res.user
//           }
//         });
//       }
//       if (cart && res.user && res.user._id) {
//         setCartApi({
//           usermetaid: res.user._id,
//           cart: cart
//         });
//       } else if (res.user && res.user.cart) {
//         dispatch({
//           type: SET_CART,
//           payload: res.user.cart
//         });
//       }
//     });
// };
export const unsetUser = () => ({
  type: UNSET_USER,
  payload: {}
});