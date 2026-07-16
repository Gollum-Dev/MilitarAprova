import { supabase } from './supabase';

export interface AdminSettings {
  id: string;
  support_email: string;
  support_phone: string;
  updated_at?: string;
}

export interface SupportMessage {
  id: string;
  user_id: string;
  sender_type: 'student' | 'admin';
  content: string;
  is_read: boolean;
  created_at: string;
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('id', 'global_settings')
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // not found
      console.error('Error fetching admin settings:', error);
    }
    return null;
  }
  return data;
}

export async function updateAdminSettings(email: string, phone: string): Promise<boolean> {
  const { error } = await supabase
    .from('admin_settings')
    .upsert({
      id: 'global_settings',
      support_email: email,
      support_phone: phone,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating admin settings:', error);
    return false;
  }
  return true;
}

export async function getStudentMessages(userId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching support messages:', error);
    return [];
  }
  return data || [];
}

export async function getAllMessagesGroupedByUser(): Promise<Record<string, SupportMessage[]>> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching all support messages:', error);
    return {};
  }

  const grouped: Record<string, SupportMessage[]> = {};
  for (const msg of (data || [])) {
    if (!grouped[msg.user_id]) grouped[msg.user_id] = [];
    grouped[msg.user_id].push(msg);
  }
  return grouped;
}

export async function sendSupportMessage(userId: string, content: string, senderType: 'student' | 'admin'): Promise<SupportMessage | null> {
  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      user_id: userId,
      sender_type: senderType,
      content,
      is_read: senderType === 'student' ? false : true // Admin sending to student marks as read? Just keeping it simple
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending support message:', error);
    return null;
  }
  return data;
}

export async function markMessagesAsRead(userId: string, readerType: 'admin' | 'student'): Promise<void> {
  // If reader is admin, mark 'student' messages as read
  // If reader is student, mark 'admin' messages as read
  const senderToMark = readerType === 'admin' ? 'student' : 'admin';
  
  const { error } = await supabase
    .from('support_messages')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('sender_type', senderToMark)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
}
