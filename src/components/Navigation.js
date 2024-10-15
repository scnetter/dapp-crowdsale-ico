import { Navbar } from "react-bootstrap";
import logo from '../logo.png';

const Navigation = () => {
    return (
        <Navbar>
            <img src={logo} alt="logo" width="40" height="40" className="d-inline-block align-top mx-3" />
            <Navbar.Brand href="#">Dapp Token ICO Crowdsale</Navbar.Brand>
        </Navbar>
    )
}

export default Navigation;