import './App.css';
import { Editor } from './Editor';
import { Signup } from './Signup';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from './Layout';
import { ErrorPage } from './ErrorPage';
import { Login } from './Login';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signup",
        element: <Signup />
      },
      {
        path: "/editor",
        element: <Editor />
      },
      // {
      //   path: "/reset",
      //   element: <ResetPassword />
      // }
    ]
  },
]);


function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App;
