import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react'
import CourtBooking from './App';
const TestComponent = ()=>{return (<p>test Component</p>)}
test("Example 1 renders successfully", () => {
    render(<CourtBooking/>);

    const element = screen.getByText(/currentUserLevel: participant/i);

    expect(element).toBeInTheDocument();
})