import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  // Lấy kích thước màn hình lúc mới vào web để set trạng thái mặc định
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  // Lắng nghe tự động: Khi người dùng kéo nhỏ cửa sổ hoặc xoay ngang điện thoại
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);  // Ép thu bé nếu là điện thoại
      } else {
        setIsCollapsed(false); // Phóng to nếu là màn PC
      }
    };

    // Đăng ký bộ lắng nghe
    window.addEventListener('resize', handleResize);
    
    // Dọn dẹp bộ lắng nghe khi tắt component
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="d-flex vh-100 vw-100 overflow-hidden bg-light">
      {/* Sidebar giờ đây nhận state tự động từ Cha truyền xuống */}
      <Sidebar 
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="d-flex flex-column flex-grow-1 overflow-hidden w-100">
        <main className="flex-grow-1 overflow-auto p-3 p-md-4">
          <div className="container-fluid p-0" style={{ maxWidth: '1200px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}