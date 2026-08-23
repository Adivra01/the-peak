import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, RefreshCw, ExternalLink, ShieldCheck } from "lucide-react";

interface ExportRow {
  id: string;
  export_type: string;
  period_start: string;
  period_end: string;
  rows_exported: number;
  file_name: string | null;
  file_url: string | null;
  status: string;
  error_message: string | null;
  anonymized: boolean;
  created_at: string;
}

const DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1AO_n9F8HAus9Gv4PTc0EgbxdM9jowYOZ";

const DataArchive = () => {
  const { toast } = useToast();
  const [exports, setExports] = useState<ExportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("data_exports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setExports((data as ExportRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runExport = async (mode: "dry" | "quarter" | "full") => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("quarterly-export", {
        body: {
          dry: mode === "dry",
          full: mode === "full",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: mode === "dry" ? "✅ Dry-run terminé" : "✅ Export terminé",
        description:
          mode === "dry"
            ? `${data?.tickets ?? 0} billets trouvés. Aucun upload ni anonymisation.`
            : `${data?.tickets ?? 0} billets exportés vers Google Drive et anonymisés.`,
      });
      if (mode !== "dry") load();
    } catch (e: any) {
      toast({
        title: "❌ Export impossible",
        description: e.message || "Vérifiez la connexion Google Drive.",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Conservation & archivage des données</h2>
        <p className="text-sm text-muted-foreground">
          Les données client sont conservées par trimestre, exportées vers Google Drive en Excel,
          puis anonymisées conformément au RGPD.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">Politique appliquée</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Export trimestriel automatique vers Google Drive (fichier Excel)</li>
              <li>
                3 onglets : Gestionnaires · Admin · Organisateurs + Stats globales par événement
              </li>
              <li>Anonymisation RGPD des noms, téléphones et emails après export</li>
            </ul>
            <a
              href={DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Ouvrir le dossier Google Drive <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={() => runExport("dry")}
            variant="outline"
            disabled={running}
            className="gap-2"
          >
            <CloudUpload className="w-4 h-4" />
            Dry-run (vérifier)
          </Button>
          <Button
            onClick={() => runExport("quarter")}
            variant="outline"
            disabled={running}
            className="gap-2"
          >
            <CloudUpload className="w-4 h-4" />
            Exporter le trimestre précédent
          </Button>
          <Button onClick={() => runExport("full")} disabled={running} className="gap-2">
            <CloudUpload className="w-4 h-4" />
            Export complet
          </Button>
          <Button onClick={load} variant="ghost" disabled={loading} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 font-semibold">Historique des exports</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : exports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun export effectué pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Période</th>
                  <th className="p-2">Billets</th>
                  <th className="p-2">Fichier</th>
                  <th className="p-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-muted/40">
                    <td className="p-2">
                      {new Date(e.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-2 capitalize">{e.export_type}</td>
                    <td className="p-2">
                      {new Date(e.period_start).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(e.period_end).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-2">{e.rows_exported}</td>
                    <td className="p-2">
                      {e.file_url ? (
                        <a
                          href={e.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {e.file_name}
                        </a>
                      ) : (
                        e.file_name || "—"
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant={e.status === "success" ? "default" : "destructive"}>
                        {e.status === "success" ? "Réussi" : "Échec"}
                      </Badge>
                      {e.anonymized && (
                        <Badge variant="outline" className="ml-1">
                          Anonymisé
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DataArchive;
