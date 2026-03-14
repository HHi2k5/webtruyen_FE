import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';

export default function AdminComments() {
  const list = useMemo(() => {
    return api.listComments({}).map(c => {
      const user = api.getUserById(c.user_id);
      const story = c.story_id ? api.getStory(c.story_id) : null;
      return { ...c, user, story };
    });
  }, []);

  const del = (id) => {
    if (confirm('Xoá bình luận này?')) {
      api.deleteComment(id, { requester: { role: 'admin' } });
      window.location.reload();
    }
  };

  return (
    <section>
      <h2>Quản lý bình luận</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Người viết</th>
            <th>Truyện</th>
            <th>Chương</th>
            <th>Nội dung</th>
            <th>Thời gian</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.user?.name || '??'}</td>
              <td>{c.story ? <Link to={`/story/${c.story.id}`}>{c.story.title}</Link> : '-'}</td>
              <td>{c.chapter_id ? <Link to={`/story/${c.story.id}/chapter/${c.chapter_id}`}>{c.chapter_id}</Link> : '-'}</td>
              <td>{c.content}</td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
              <td><button className="danger" onClick={() => del(c.id)}>Xoá</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
