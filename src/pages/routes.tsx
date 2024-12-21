import { createBrowserRouter } from "react-router-dom";
import Layout from "pages/Layout";
import Calendar from "@/components/Calendar";
import { CalendarProvider } from "@/lib/store/CNCalender";

export default createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
           {path: "/", element: (
            <CalendarProvider>
                <Calendar/>
            </CalendarProvider>
           )},
        //    {path: "/signin", element: <SignIn/>},
        //    {path: "/signup", element: <SignUp/>},
        //    {path: "/creatbook", element: <BookCreator/>},
        ]
    },
]);