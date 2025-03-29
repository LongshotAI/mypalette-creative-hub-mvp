
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../chat/ChatWidget';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Create a context object with the scroll position
  const childrenWithProps = React.Children.map(children, child => {
    // Check if the child is a valid React element
    if (React.isValidElement(child)) {
      // Clone the element with the scrollPosition prop, using a proper type cast
      return React.cloneElement(child, {
        ...child.props,
        scrollPosition
      });
    }
    return child;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {childrenWithProps}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default DefaultLayout;
