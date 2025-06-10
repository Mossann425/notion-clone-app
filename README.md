# Notion Clone

このプロジェクトは、Next.js 14（App Router）とSupabaseを使用して構築された、Notionライクなシンプルなメモアプリケーションです。Markdown形式でメモを記述・表示し、フォルダでメモを整理する基本的な機能を提供します。

## 要件 (Requirements)

*   **フロントエンド:** Next.js 14 (App Router), React, TypeScript
*   **スタイリング:** Tailwind CSS (@tailwindcss/typography プラグインを含む)
*   **データベース/バックエンド:** Supabase (PostgreSQL, RLS)
*   **デプロイ (想定):** Vercel (GitHub連携)
*   **開発環境:** Cursor

## 機能 (Features)

*   **メモの作成:** 新しいメモをタイトルと内容（Markdown形式）で作成できます。
*   **メモの表示:** メモ一覧ページで既存のメモをリスト表示し、各メモの冒頭部分をプレビューできます。
*   **メモの編集:** 各メモをクリックして詳細ページに遷移し、タイトルと内容を編集できます。編集内容は自動的にデータベースに保存されます。
*   **メモの削除:** 詳細編集ページからメモを完全に削除できます。
*   **Markdown表示:** メモの内容をMarkdown形式で記述し、整形された状態で表示・プレビューできます。
*   **サイドバー:**
    *   すべてのメモ（未分類含む）とフォルダが一覧表示されます。
    *   現在開いているメモがハイライト表示されます。
    *   新しいフォルダを作成できます。
*   **データ永続化:** 全てのメモとフォルダデータはSupabaseに保存されます。

## 使い方 (Usage)

### 1. プロジェクトのセットアップ

1.  **リポジトリをクローン:**
    ```bash
    git clone [あなたのGitHubリポジトリのURL] notion-clone
    cd notion-clone
    ```

2.  **依存関係のインストール:**
    プロジェクトの作成時に `npm` を使用したため、`npm` で依存関係をインストールします。
    ```bash
    npm install
    # または、すでにインストール済みの場合は npm install react-markdown @tailwindcss/typography などを実行
    ```

### 2. Supabaseのセットアップ

1.  **Supabaseプロジェクトの作成:**
    *   Supabaseのウェブサイト ([https://supabase.com/](https://supabase.com/)) で新しいプロジェクトを作成します。
    *   プロジェクトの **Project URL** と **`anon public` キー** を控えておきます。

2.  **データベーステーブルの作成:**
    Supabaseダッシュボードの「Table Editor」で以下のテーブルを作成します。

    **`notes` テーブル:**
    | カラム名 | 型                   | デフォルト値       | 備考                                                |
    | :------- | :------------------- | :----------------- | :-------------------------------------------------- |
    | `id`     | `uuid`               | `gen_random_uuid()`| Primary Key                                         |
    | `title`  | `text`               |                    | Nullable: Yes                                       |
    | `content`| `text`               |                    | Nullable: Yes                                       |
    | `folderId`| `uuid`              |                    | Nullable: Yes, Foreign Key to `public.folders.id` (On Delete: SET NULL) |
    | `created_at`| `timestamp with time zone`| `now()`      |                                                     |
    | `updated_at`| `timestamp with time zone`| `now()`      | **ON UPDATE: `now()`** (SQLエディタでトリガー設定推奨) |

    **`folders` テーブル:**
    | カラム名 | 型                   | デフォルト値       | 備考                |
    | :------- | :------------------- | :----------------- | :------------------ |
    | `id`     | `uuid`               | `gen_random_uuid()`| Primary Key         |
    | `name`   | `text`               |                    | Nullable: No, Unique: Yes |
    | `created_at`| `timestamp with time zone`| `now()`      |                     |
    | `updated_at`| `timestamp with time zone`| `now()`      | **ON UPDATE: `now()`** |

3.  **RLS (Row Level Security) ポリシーの設定:**
    `notes` と `folders` の両テーブルでRLSを有効にし、開発中は全ての操作（`SELECT`, `INSERT`, `UPDATE`, `DELETE`）に対して `To roles: public` で `Using expression: true` のポリシーを設定してください。

    **`updated_at` カラムの `ON UPDATE now()` の設定 (SQLエディタ):**
    もしUIから設定できない場合、SupabaseのSQLエディタで以下のコマンドを実行してください。

    ```sql
    -- set_updated_at 関数を作成
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- notes テーブルにトリガーを設定
    CREATE TRIGGER notes_updated_at_trigger
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

    -- folders テーブルにトリガーを設定 (もし folders テーブルにも updated_at があれば)
    CREATE TRIGGER folders_updated_at_trigger
    BEFORE UPDATE ON public.folders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
    ```

4.  **環境変数の設定:**
    プロジェクトのルートに `.env.local` ファイルを作成し、SupabaseのURLとキーを設定します。
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    `YOUR_SUPABASE_URL` と `YOUR_SUPABASE_ANON_KEY` は、あなたのSupabaseプロジェクトの実際の値に置き換えてください。

### 3. アプリケーションの実行

1.  **開発サーバーを起動:**
    ```bash
    npm run dev
    ```

2.  ブラウザで `http://localhost:3000/notes` にアクセスします。

## ファイル構造 (File Structure)
notion-clone/
├── public/ # 静的ファイル (画像など)
├── src/
│ ├── app/ # Next.js App Router のルート
│ │ ├── layout.tsx # アプリケーション全体のルートレイアウト (サイドバーを配置)
│ │ ├── globals.css # グローバルスタイルシート (Tailwind CSS)
│ │ ├── page.tsx # ホームページ (現時点では使用していません)
│ │ └── notes/ # メモ関連のルート
│ │ ├── page.tsx # メモ一覧ページ (/notes)
│ │ └── [id]/ # 動的ルーティング (メモ詳細・編集ページ /notes/[id])
│ │ └── page.tsx
│ ├── components/ # 再利用可能なUIコンポーネント
│ │ ├── LayoutWrapper.tsx # layout.tsxでusePathnameを使用するためのラッパー
│ │ ├── NoteEditor.tsx # メモの作成・編集フォーム (自動保存またはボタン保存)
│ │ └── Sidebar.tsx # 左サイドバー (フォルダとメモのリスト、フォルダ追加機能)
│ └── lib/ # ユーティリティ関数や設定ファイル
│ └── supabase.ts # Supabaseクライアントの初期化
├── .env.local # 環境変数 (Git管理しない)
├── .gitignore # Git管理から除外するファイル
├── next.config.js # Next.js の設定
├── package.json # プロジェクトの依存関係とスクリプト
├── pnpm-lock.yaml # pnpm のロックファイル (npm を使用している場合は package-lock.json)
├── postcss.config.js # PostCSS の設定 (Tailwind CSS用)
├── README.md # このファイル
├── tailwind.config.js # Tailwind CSS の設定 (@tailwindcss/typography プラグインを含む)
└── tsconfig.json # TypeScript の設定
更新が完了したら、教えてください。
