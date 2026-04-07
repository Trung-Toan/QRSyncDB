import { Nav, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { HouseDoor, CashStack, CardText, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

export default function Sidebar({ isCollapsed, toggleCollapse }) {
  const menuItems = [
    { path: '/', icon: <HouseDoor size={20} />, label: 'Trang chủ', end: true },
    { path: '/add-cash', icon: <CashStack size={20} />, label: 'Thêm tiền mặt' },
    { path: '/transactions', icon: <CardText size={20} />, label: 'Chi tiết giao dịch' },
  ];

  return (
    <div 
      className="bg-dark text-white d-flex flex-column" 
      style={{ 
        width: isCollapsed ? '70px' : '260px',     // Mobile tôi để 70px cho gọn, PC để 260px
        minWidth: isCollapsed ? '70px' : '260px',  // Cực kỳ quan trọng: Giữ khung không bị móp méo
        transition: 'all 0.3s ease-in-out',        // Hiệu ứng trượt ngang
        overflowX: 'hidden' 
      }}
    >
      {/* Logo */}
      <div className="text-center mb-2 mt-3 px-2">
        {isCollapsed ? (
          <h4 className="text-info fw-bold m-0" title="Quản lý dòng tiền">QLDT</h4>
        ) : (
          <div style={{ whiteSpace: 'nowrap' }}>
            <h4 className="text-uppercase fw-bold text-info m-0">Quản lý dòng tiền</h4>
            <small className="text-muted">Quản lý dòng tiền</small>
          </div>
        )}
        <hr className="text-secondary mt-3" />
      </div>

      {/* Khung Menu */}
      <div className="flex-grow-1 px-2 mt-2">
        <Nav variant="pills" className="flex-column">
          {menuItems.map((item, index) => (
            <Nav.Item key={index} className="mb-2">
              <Nav.Link 
                as={NavLink} 
                to={item.path} 
                end={item.end}
                className={`text-white d-flex align-items-center py-2 ${isCollapsed ? 'justify-content-center px-0' : 'px-3 gap-3'}`}
                title={isCollapsed ? item.label : ''} 
              >
                {item.icon}
                {!isCollapsed && <span className="text-nowrap">{item.label}</span>}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {/* Nút thu nhỏ/phóng to bằng tay: Ẩn trên Mobile (d-none d-md-flex) */}
      <div className="p-3 border-top border-secondary d-none d-md-flex justify-content-center">
        <Button variant="dark" onClick={toggleCollapse} className="text-secondary w-100 p-1 bg-transparent border-0">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
    </div>
  );
}