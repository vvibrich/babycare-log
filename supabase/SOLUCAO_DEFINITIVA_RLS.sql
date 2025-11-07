                                                                                                                                    -- ============================================
                                                                                                                                    -- SOLUÇÃO DEFINITIVA: RLS não está bloqueando
                                                                                                                                    -- ============================================
                                                                                                                                    -- Os dados estão corretos (user_id associado)
                                                                                                                                    -- Mas usuários estão vendo dados de outros
                                                                                                                                    -- Causa: RLS desabilitado ou policies incorretas
                                                                                                                                    -- ============================================

                                                                                                                                    -- PASSO 1: Verificar estado atual
                                                                                                                                    -- ============================================
                                                                                                                                    SELECT 
                                                                                                                                      'RLS Status' as verificacao,
                                                                                                                                      tablename,
                                                                                                                                      rowsecurity as rls_ativo
                                                                                                                                    FROM pg_tables
                                                                                                                                    WHERE tablename IN ('records', 'children');

                                                                                                                                    -- PASSO 2: HABILITAR RLS (se não estiver)
                                                                                                                                    -- ============================================
                                                                                                                                    ALTER TABLE records ENABLE ROW LEVEL SECURITY;
                                                                                                                                    ALTER TABLE children ENABLE ROW LEVEL SECURITY;

                                                                                                                                    -- PASSO 3: LIMPAR TODAS AS POLICIES ANTIGAS
                                                                                                                                    -- ============================================
                                                                                                                                    DROP POLICY IF EXISTS "Users can view their own records" ON records;
                                                                                                                                    DROP POLICY IF EXISTS "Users can insert their own records" ON records;
                                                                                                                                    DROP POLICY IF EXISTS "Users can update their own records" ON records;
                                                                                                                                    DROP POLICY IF EXISTS "Users can delete their own records" ON records;

                                                                                                                                    DROP POLICY IF EXISTS "Users can view their own children" ON children;
                                                                                                                                    DROP POLICY IF EXISTS "Users can insert their own children" ON children;
                                                                                                                                    DROP POLICY IF EXISTS "Users can update their own children" ON children;
                                                                                                                                    DROP POLICY IF EXISTS "Users can delete their own children" ON children;

                                                                                                                                    -- PASSO 4: CRIAR POLICIES CORRETAS
                                                                                                                                    -- ============================================

                                                                                                                                    -- RECORDS: SELECT (visualizar)
                                                                                                                                    CREATE POLICY "Users can view their own records"
                                                                                                                                      ON records 
                                                                                                                                      FOR SELECT
                                                                                                                                      USING (auth.uid() = user_id);

                                                                                                                                    -- RECORDS: INSERT (criar)
                                                                                                                                    CREATE POLICY "Users can insert their own records"
                                                                                                                                      ON records 
                                                                                                                                      FOR INSERT
                                                                                                                                      WITH CHECK (auth.uid() = user_id);

                                                                                                                                    -- RECORDS: UPDATE (editar)
                                                                                                                                    CREATE POLICY "Users can update their own records"
                                                                                                                                      ON records 
                                                                                                                                      FOR UPDATE
                                                                                                                                      USING (auth.uid() = user_id)
                                                                                                                                      WITH CHECK (auth.uid() = user_id);

                                                                                                                                    -- RECORDS: DELETE (deletar)
                                                                                                                                    CREATE POLICY "Users can delete their own records"
                                                                                                                                      ON records 
                                                                                                                                      FOR DELETE
                                                                                                                                      USING (auth.uid() = user_id);

                                                                                                                                    -- CHILDREN: SELECT (visualizar)
                                                                                                                                    CREATE POLICY "Users can view their own children"
                                                                                                                                      ON children 
                                                                                                                                      FOR SELECT
                                                                                                                                      USING (auth.uid() = user_id);

                                                                                                                                    -- CHILDREN: INSERT (criar)
                                                                                                                                    CREATE POLICY "Users can insert their own children"
                                                                                                                                      ON children 
                                                                                                                                      FOR INSERT
                                                                                                                                      WITH CHECK (auth.uid() = user_id);

                                                                                                                                    -- CHILDREN: UPDATE (editar)
                                                                                                                                    CREATE POLICY "Users can update their own children"
                                                                                                                                      ON children 
                                                                                                                                      FOR UPDATE
                                                                                                                                      USING (auth.uid() = user_id)
                                                                                                                                      WITH CHECK (auth.uid() = user_id);

                                                                                                                                    -- CHILDREN: DELETE (deletar)
                                                                                                                                    CREATE POLICY "Users can delete their own children"
                                                                                                                                      ON children 
                                                                                                                                      FOR DELETE
                                                                                                                                      USING (auth.uid() = user_id);

                                                                                                                                    -- PASSO 5: VERIFICAR SE FUNCIONOU
                                                                                                                                    -- ============================================
                                                                                                                                    SELECT 
                                                                                                                                      'Verificação de Policies' as status,
                                                                                                                                      COUNT(*) as total_policies
                                                                                                                                    FROM pg_policies
                                                                                                                                    WHERE tablename IN ('records', 'children');

                                                                                                                                    -- Deve retornar 8 (4 para records + 4 para children)

                                                                                                                                    -- PASSO 6: TESTE MANUAL
                                                                                                                                    -- ============================================
                                                                                                                                    -- Instruções:
                                                                                                                                    -- 1. Execute este arquivo completo no SQL Editor
                                                                                                                                    -- 2. Faça LOGOUT do app
                                                                                                                                    -- 3. Login como vibrichdev@gmail.com
                                                                                                                                    --    → Deve ver 6 registros
                                                                                                                                    -- 4. Logout
                                                                                                                                    -- 5. Login como viniciusvibrich@ioasys.com.br
                                                                                                                                    --    → Deve ver 0 registros (lista vazia)
                                                                                                                                    -- 6. Crie um registro novo
                                                                                                                                    --    → Deve aparecer apenas esse registro

                                                                                                                                    -- ============================================
                                                                                                                                    -- Se ainda não funcionar, execute:
                                                                                                                                    -- ============================================

                                                                                                                                    -- Ver se auth.uid() está retornando valor
                                                                                                                                    -- (Execute no SQL Editor enquanto logado no app)
                                                                                                                                    /*
                                                                                                                                    SELECT 
                                                                                                                                      auth.uid() as meu_id,
                                                                                                                                      auth.email() as meu_email,
                                                                                                                                      (SELECT COUNT(*) FROM records WHERE user_id = auth.uid()) as meus_registros;
                                                                                                                                    */

                                                                                                                                    -- Se auth.uid() retorna NULL: Problema de autenticação
                                                                                                                                    -- Se retorna UUID mas meus_registros = 0: User_id não está sendo salvo

                                                                                                                                    -- ============================================
                                                                                                                                    -- IMPORTANTE: Após executar
                                                                                                                                    -- ============================================
                                                                                                                                    -- 1. Limpe cache do navegador (Ctrl+Shift+Del)
                                                                                                                                    -- 2. Faça logout completo
                                                                                                                                    -- 3. Feche e abra o navegador
                                                                                                                                    -- 4. Login novamente
                                                                                                                                    -- 5. Teste a isolação de dados
