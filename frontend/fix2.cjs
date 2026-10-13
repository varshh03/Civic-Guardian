const fs = require('fs');

function rep(file, search, replace) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.split(search).join(replace);
  fs.writeFileSync(file, c);
}

rep('src/pages/Home.tsx', '<img src={\\/uploads/\\}', '<img src={`${API_BASE}/uploads/${c.image}`}');
rep('src/pages/Home.tsx', '<Link to={`/complaints/\\}', '<Link to={`/complaints/${c.id}`}');
rep('src/pages/Report.tsx', 'navigate(`/complaints/\\`);', 'navigate(`/complaints/${res.id}`);');
rep('src/pages/Report.tsx', 'navigate(`/complaints/\\`);', 'navigate(`/complaints/${duplicateData.id}`);');
rep('src/pages/ComplaintDetail.tsx', 'src={`\\${API_BASE}/uploads/\\`}', 'src={`${API_BASE}/uploads/${c.image}`}');
rep('src/pages/ComplaintDetail.tsx', 'src={`\\${API_BASE}/uploads/\\`}', 'src={`${API_BASE}/uploads/${c.resolution_image}`}');
rep('src/pages/Notifications.tsx', "to={n.complaint_id ? `/complaints/\\` : '#'}", "to={n.complaint_id ? `/complaints/${n.complaint_id}` : '#'}");
rep('src/pages/OfficerQueue.tsx', 'navigate(`/complaints/\\`)', 'navigate(`/complaints/${c.id}`)');
rep('src/pages/Leaderboard.tsx', '#\\}', '#${i + 1}');
rep('src/components/ComplaintCard.tsx', 'src={`\\${API_BASE}/uploads/\\`}', 'src={`${API_BASE}/uploads/${complaint.image}`}');
rep('src/components/ComplaintCard.tsx', 'text=\\${complaint.issue_type.charAt(0).toUpperCase()}', 'text=${complaint.issue_type.charAt(0).toUpperCase()}');
rep('src/components/AiResultCard.tsx', 'width: `\\%`', 'width: `${confidence * 100}%`');
