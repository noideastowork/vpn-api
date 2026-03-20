import { createClient } from '@supabase/supabase-js';

// Подключаемся к Supabase (ключи спрячем в настройках Vercel)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Ищем id в ссылке, например ?tg_id=1111
  const { tg_id } = req.query;

  if (!tg_id) {
    return res.status(400).send('Укажите ID пользователя');
  }

  // Запрашиваем из таблицы vpn_users колонку links для этого tg_id
  const { data, error } = await supabase
    .from('vpn_users')
    .select('links')
    .eq('tg_id', parseInt(tg_id))
    .single();

  if (error || !data) {
    return res.status(404).send('Пользователь не найден');
  }

  // Превращаем массив ссылок в один текст (каждая ссылка с новой строки)
  const linksString = data.links.join('\n');

  // VPN-клиенты (V2Ray, Nekobox) любят, когда ссылки закодированы в Base64
  const base64Links = Buffer.from(linksString).toString('base64');

  // Отдаем результат как простой текст
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(base64Links);
}
