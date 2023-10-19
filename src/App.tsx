import './App.css';
import { Editor } from './components/Editor';
import { Signup } from './components/user/Signup';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from './components/Layout';
import { ErrorPage } from './components/ErrorPage';
import { Login } from './components/user/Login';
import { ResetPassword } from './components/user/ResetPassword';

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
      {
        path: "/reset",
        element: <ResetPassword />
      }
    ]
  },
]);


function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App;
