import { useState, useEffect, useContext, createContext } from "react";

const PageContext = createContext();

const PageProvider = ({ children }) => {
    const [page, setPage] = useState(1);

    useEffect(() => {
        localStorage.setItem('page' , JSON.stringify(1));
    }, []);

    return (
        <PageContext.Provider value={[page, setPage]}>
            {children}
        </PageContext.Provider>
    );
};

// Custom hook
const usePage = () => useContext(PageContext);

export { usePage, PageProvider };
