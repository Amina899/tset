import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle, MessageSquare, Shield, Check, X } from 'lucide-react';
import { Post } from '../types';

interface PostListProps {
  posts: Post[];
  onSendHelp: (postId: string) => Promise<void>; 
  onFlag: (postId: string) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onSendHelp}) => {
  const getRiskBadgeColor = (suicide_level: string) => {
    switch (suicide_level) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [sendingHelpIds, setSendingHelpIds] = useState<Set<string>>(new Set());
  const getRiskIcon = (suicide_level: string) => {
    switch (suicide_level) {
      case 'HIGH':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return {
        relative: 'Invalid date',
        absolute: 'Invalid date',
      };
    }
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      absolute: format(date, 'MMM d, yyyy h:mm a')
    };
  };

    useEffect(() => {
    // Убираем id из sendingHelpIds, если статус уже не not_sent
    const updatedSendingHelpIds = new Set(sendingHelpIds);
    for (const post of posts) {
      if (
        post.invention_outcomes_status !== 'not_sent' &&
        sendingHelpIds.has(post._id)
      ) {
        updatedSendingHelpIds.delete(post._id);
      }
    }
    if (updatedSendingHelpIds.size !== sendingHelpIds.size) {
      setSendingHelpIds(updatedSendingHelpIds);
    }
  }, [posts, sendingHelpIds]);

const handleSendHelpClick = async (postId: string) => {
    if (!postId) {
    console.error('Send Help clicked but postId is undefined');
    return;
  }
   if (sendingHelpIds.has(postId)) return; 

  setSendingHelpIds(prev => new Set(prev).add(postId));
  try {
    await onSendHelp(postId);
  } catch (e) {
    // Обработка ошибки, например toast
  }
  // Удаление из sendingHelpIds сделаем в useEffect ниже, при обновлении posts
};

useEffect(() => {
  // Убираем из sendingHelpIds те, которые теперь уже не "not_sent"
  setSendingHelpIds(prev => {
    const newSet = new Set(prev);
    posts.forEach(post => {
      if (post.invention_outcomes_status !== 'not_sent' && newSet.has(post._id)) {
        newSet.delete(post._id);
      }
    });
    return newSet;
  });
}, [posts]);



  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium flex items-center">
          <MessageSquare size={18} className="text-indigo-600 mr-2" />
          Recent Posts
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
            {posts.length} posts
          </span>
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {posts.map(post => {
          const time = formatTimestamp(post.analyzed_at);     
          const isSendingHelp = sendingHelpIds.has(post._id);
          const helpSent = post.invention_outcomes_status === 'sent' || post.invention_outcomes_status === 'accepted' || post.invention_outcomes_status === 'declined';    
          return (
            <div key={post._id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    post.suicide_level === 'HIGH' ? 'bg-red-500' : 
                    post.suicide_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {post.username || 'Anonymous User'}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRiskBadgeColor(post.suicide_level)}`}>
                    {post.suicide_level
                      ? post.suicide_level.charAt(0).toUpperCase() + post.suicide_level.slice(1)
                      : 'Unknown'} Risk ({post.suicide_percentage ?? 'N/A'}%)
                  </span>
                  {getRiskIcon(post.suicide_level)}
                </div>
                <div className="text-xs text-gray-500" title={time.absolute}>
                  {time.relative}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{post.content}</p>
              
              {post.keywords && post.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.keywords.map(keyword => (
                    <span key={keyword} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span className={`capitalize px-2 py-0.5 rounded ${
                    post.source === 'twitter' ? 'bg-white text-black border border-black' :
                    post.source === 'instagram' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    post.source === 'vk' ?  'bg-indigo-100 text-indigo-800 border-indigo-200' : 
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {`${post.source} ${post.type.replace('_', ' ')}`}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                    {post.language}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {helpSent ? (
                    <div className="flex items-center text-xs">
                      <span className={`px-2 py-1 rounded flex items-center ${
                          post.invention_outcomes_status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : post.invention_outcomes_status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.invention_outcomes_status === 'accepted' ? (
                          <>
                            <Check size={14} className="mr-1" />
                            Help Accepted
                          </>
                        ) : post.invention_outcomes_status === 'declined' ? (
                          <>
                            <X size={14} className="mr-1" />
                            Help Declined
                          </>
                        ) : (
                          'Help Sent'
                        )}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendHelpClick(post._id)}
                      disabled={isSendingHelp}
                      className="text-xs bg-indigo-600 text-white px-2 py-1 rounded flex items-center hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Shield size={14} className="mr-1" />
                      {isSendingHelp ? 'Sending...' : 'Send Help'}
                    </button>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostList;