import { Navbar, Button, Container } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';

export default function Topbar({ onOpenSidebar }) {
  return (
    // d-md-none: Ẩn thanh này từ màn hình medium (tablet) trở lên
    <Navbar bg="white" className="border-bottom shadow-sm d-md-none px-2 py-2 mb-3">
      <Container fluid className="p-0">
        <Button variant="light" onClick={onOpenSidebar} className="border">
          <List size={24} />
        </Button>
        <Navbar.Brand className="ms-2 fw-bold text-info m-0">
          Quản lý dòng tiền
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}